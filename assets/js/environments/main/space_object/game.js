JL.webgl.variables.game_inputs = [
	{ key : 'game_type', label : 'Game', type : 'dropdown', ui_order : '0_a', default : 'soccer', options : [
		{ name : 'Soccer'    , value : 'soccer'    , },
		{ name : 'Basketball', value : 'basketball', },
		{ name : 'Hockey'    , value : 'hockey'    , },
		{ name : 'Tile Drop' , value : 'tile_drop' , },
	] },
	...JL.webgl.variables.team_inputs,
	{ key : 'duration'  , label : 'Game Duration (in mins)', type : 'int'     , ui_order : '0_e', default : 5, min : 1   , max : 60, },
	{ key : 'ball_size' , label : 'Ball Size'              , type : 'float'   , ui_order : '0_g', default : 1, min : 0.25, max : 2 , },
	{ key : 'difficulty', label : 'Difficulty'             , type : 'dropdown', ui_order : '0_i', default : 'easy', options : [
		{ name : 'Easy'  , value : 'easy'  , },
		{ name : 'Medium', value : 'medium', },
		{ name : 'Hard'  , value : 'hard'  , },
	] },
];

JL.webgl.space_object.game = JL.functions.inherit_class( function(){}, JL.webgl.space_object._regular, {
	_inputs_exclude : [ 'draw_xyz', 'is_impostor', ].map( key => ({ key }) ),
	_inputs : [
		...JL.webgl.variables.game_inputs,
		{ key : 'on_finish', type : 'function' , optional : true, },
	]
} );

JL.webgl.space_object.game.prototype._on_init = function( p ){
	var self = this;

	if( JL.webgl.variables.game ) Object.assign( this, JL.webgl.variables.game );

	// TODO : test
	this.duration_in_seconds = this.duration * 60;
	// this.duration_in_seconds = 15;

	// -- Initialize teams --

	this.teams = [];
	for( var t_i = 0; t_i < 2; t_i++ ){
		var s_o_args = {
			parent_object : this,
		};

		for( var input of JL.webgl.variables.team_inputs ){
			var val = this[ input.key ];
			if( val !== undefined ) s_o_args[ input.key ] = val;
		}

		s_o_args.side = ( t_i ? 1 : -1 );

		if( t_i ) s_o_args.color = [ 1  , 0.2, 0.2 ];
		else      s_o_args.color = [ 0.2, 0.4, 1   ];

		var team_number = ( t_i + 1 );

		try{ JL.webgl.graphics_objects[ 'wall_team_' + team_number ].frags_vec4.color_factor = s_o_args.color.map( c => c     ).concat([ 1 ]); } catch(e){} 
		try{ JL.webgl.graphics_objects[ 'goal_team_' + team_number ].frags_vec4.color_factor = s_o_args.color.map( c => c * 4 ).concat([ 1 ]); } catch(e){}

		try{ JL.webgl.graphics_objects[ 'floor' ].frags_mat4.gradient_overlay_x_colors.elements[ t_i ] = s_o_args.color.concat([ 0.5 ]); } catch(e){}

		s_o_args.name = 'Team ' + team_number;

		var team = this.environment.add_space_object( s_o_args, JL.webgl.space_object.team );

		team.team_index = t_i;

		this.teams.push( team );
	}

	// -- Initialize ball/puck --

	var ball_params = {
		collider : {
			mass             : 10,
			collision_filter : 'item',
		},
	};
	switch( this.game_type ){
		case 'soccer':
			var s = 4 * this.ball_size;
			ball_params.scale                = [s,s,s];
			ball_params.graphics_objects     = [ JL.webgl.graphics_objects.game_ball ];
			ball_params.collider.shapes      = [{ type : 'sphere', radius : s / 2, }];
			ball_params.collider.restitution = 0.8;
			break;
		case 'tile_drop':
			var s = 4 * this.ball_size;
			ball_params.scale                     = [s,s,s];
			ball_params.graphics_objects          = [ JL.webgl.graphics_objects.game_ball ];
			ball_params.collider.shapes           = [{ type : 'sphere', radius : s / 2, }];
			ball_params.collider.restitution      = 0.95;
			ball_params.collider.collision_filter = 'ball';
			ball_params.collider.on_collide       = function( colliding_body, collision ){
				try{
					var s_o = JL.webgl.functions.get_space_object_from_physics_body_id( colliding_body.a );
					if( s_o && s_o instanceof JL.webgl.space_object.player ){
						self.set_ball_team( s_o.parent_object );
					}
				} catch(e){}
			};
			break;
		case 'hockey':
			var s = 4 * this.ball_size;
			ball_params.scale                = [s,s,s];
			ball_params.graphics_objects     = [ JL.webgl.graphics_objects.game_puck ];
			ball_params.collider.shapes      = [{ type : 'cylinder', rad_top : s / 2, rad_bot : s / 2, height : s / 8, }];
			ball_params.collider.restitution = 0.8;
			break;
	}

	this.ball = this.environment.add_space_object( ball_params, JL.webgl.space_object._physics );

	this.ball.is_game_ball = true;

	switch( this.game_type ){
		case 'soccer':
			this.ball.set_uniforms( 'frags_vec4', { color_factor : [ 0.8, 0.8, 0.8, 1 ] } );
			break;
		case 'hockey':
			this.ball.set_uniforms( 'frags_vec4', { color_factor : [ 0.1, 0.1, 0.1, 1 ] } );
			break;
		case 'tile_drop':
			this.ball.set_uniforms( 'frags_vec4', { color_factor : [ 1.0, 1.0, 0.3, 1 ] } );
			break;
	}

	// -- Initialize goals --

	var goal_params = {
		motion           : 'no_collision',
		collision_filter : 'item_sensor',
	};

	if( [ 'soccer', 'hockey', ].includes( this.game_type ) ){
		goal_params.shapes = [{ type : 'cube', dimensions : { x : 4, y : 10, z : 8 }, }];

		this.goal_1 = this.environment.add_collider( Object.assign( JL.functions.deep_copy( goal_params ), {
			position   : { x : -56, y : 10, z : 0 },
			on_collide : function( colliding_body ){ self.score_goal({ colliding_body, team_id : 1, }); },
		} ) );

		this.goal_2 = this.environment.add_collider( Object.assign( JL.functions.deep_copy( goal_params ), {
			position   : { x : 56, y : 10, z : 0 },
			on_collide : function( colliding_body ){ self.score_goal({ colliding_body, team_id : 0, }); },
		} ) );

		var goal_name_params = { y : 2, size : 100, z_index : 1, text_properties : { color : "#fff", font_size : 100, outline_width : 5 } };

		this.goal_name_1 = this.environment.add_space_object( Object.assign( JL.functions.deep_copy( goal_name_params ), {
			x : -56, yaw :  90, text : this.teams[ 0 ].name,
		} ), JL.webgl.space_object._text );

		this.goal_name_2 = this.environment.add_space_object( Object.assign( JL.functions.deep_copy( goal_name_params ), {
			x :  56, yaw : -90, text : this.teams[ 1 ].name,
		} ), JL.webgl.space_object._text );
	}

	if( this.game_type == 'tile_drop' ){
		goal_params.shapes = [{ type : 'cube', dimensions : { x : 100, y : 10, z : 100 }, }];

		this.goal_1 = this.environment.add_collider( Object.assign( JL.functions.deep_copy( goal_params ), {
			position   : { x : -100, y : -15, z : 0 },
			on_collide : function( colliding_body ){ self.score_goal({ colliding_body, team_id : 1, defending_team_id : 0, }); },
		} ) );

		this.goal_2 = this.environment.add_collider( Object.assign( JL.functions.deep_copy( goal_params ), {
			position   : { x :  100, y : -15, z : 0 },
			on_collide : function( colliding_body ){ self.score_goal({ colliding_body, team_id : 0, defending_team_id : 1, }); },
		} ) );

		this.create_tiles();
	}

	// -- Initialized positions of all s_o's --
	this.reset_positions();

	this.start();
};

JL.webgl.space_object.game.prototype.reset_positions = function(){
	this.ball.reset_physics();
	this.ball.set_physics_position( 0, 5, 0 );

	for( var team of this.teams ) team.reset_positions();
};

JL.webgl.space_object.game.prototype.score_goal = function( p ){
	if( !this.is_game_over ){
		if( p.colliding_body ){
			var colliding_s_o = JL.webgl.functions.get_space_object_from_physics_body_id( p.colliding_body.a );
			if( !( colliding_s_o && colliding_s_o.is_game_ball ) ) return;
		}

		this.teams[ p.team_id ].increment_score( 1 );

		this.reset_positions();

		if( this.game_type == 'tile_drop' ){
			this.set_ball_team();
			this.create_tiles({ team_index : p.defending_team_id, });
		}

		JL.webgl.ui.item.scoreboard.draw();
	}
};

JL.webgl.space_object.game.prototype.set_ball_team = function( team ){
	if( !team ){
		this.ball.set_uniforms( 'frags_vec4', { color_factor : [ 1.0, 1.0, 0.3, 1 ] } );
		delete this.ball.team_index;
	}
	else{
		this.ball.set_uniforms( 'frags_vec4', { color_factor : team.color.map( x => 1.5 * x ).concat([ 1 ]) } );
		this.ball.team_index = team.team_index;
	}
};

JL.webgl.space_object.game.prototype.create_tiles = function( p ){
	var self = this;

	var p = p || {};

	var x_bounds = function(){ return true; };
	if( p.team_index !== undefined ){
		x_bounds = ( p.team_index ?
			function( x ){ return ( x >  0 ); } :
			function( x ){ return ( x <= 0 ); }
		);
	}

	if( this.tiles ){
		this.tiles = this.tiles.filter(function( t ){
			var is_removing = x_bounds( t._x );
			if( is_removing ) t.remove();
			return !is_removing;
		});
	}
	else{
		this.tiles = [];
	}

	var tile_size      = 10;
	var tile_size_half = tile_size / 2;
	for        ( var x = -50 - tile_size_half; x <= 50; x += tile_size ){
		if( !x_bounds( x ) ) continue;
		for( var z = -50 - tile_size_half; z <= 50; z += tile_size ){
			var x_min = x - tile_size_half;
			var x_max = x + tile_size_half;
			var z_min = z - tile_size_half;
			var z_max = z + tile_size_half;
			if( 
				JL.functions.distance_xz({ x : 0, z : 0 }, { x : x_min, z : z_min } ) >= 50 && 
				JL.functions.distance_xz({ x : 0, z : 0 }, { x : x_max, z : z_min } ) >= 50 &&
				JL.functions.distance_xz({ x : 0, z : 0 }, { x : x_min, z : z_max } ) >= 50 &&
				JL.functions.distance_xz({ x : 0, z : 0 }, { x : x_max, z : z_max } ) >= 50
			) continue;

			var tile_params = {
				graphics_objects : [ JL.webgl.graphics_objects.floor_tile ],
				scale            : [ tile_size, tile_size, tile_size, ],
				collider         : {
					position         : { x, y : -0.1 * tile_size, z, },
					shapes           : [{ type : 'cube', dimensions : { x : 0.5 * tile_size, y : 0.1 * tile_size, z : 0.5 * tile_size }, }],
					restitution      : 0.8,
					collision_filter : 'tile',
					on_collide       : function( colliding_body, collision ){
						var impulse = JL.webgl.physics.get_impulse_of_collision( collision );
						if( impulse > 50 ){
							var tile = this.parent_space_object;
							if(
								self.ball.team_index !== undefined && 
								self.ball.team_index != tile.team_index
							){
								self.hit_tile({ tile, });
							}
						}
					},
				},
			};

			var tile = this.environment.add_space_object( tile_params, JL.webgl.space_object._physics );

			tile._x = x;

			if( x > 0 ) tile.team_index = 1;
			else        tile.team_index = 0;

			tile.color = this.teams[ tile.team_index ].color.concat([0]);

			tile.color_mag = 0.25;

			tile.set_uniforms( 'frags_vec4', { color_add : tile.color.map( x => tile.color_mag * x ), } );

			this.tiles.push( tile );
		}
	}
};

JL.webgl.space_object.game.prototype.hit_tile = function( p ){
	var tile = p.tile;

	// tile.color_mag += 1; // Uncomment to test having tiles remove on one hit.
	tile.color_mag += 0.5;

	tile.set_uniforms( 'frags_vec4', { color_add : tile.color.map( x => tile.color_mag * x ), } );

	if( tile.color_mag >= 1 ) tile.remove();
};

JL.webgl.space_object.game.prototype.get_hr_time = function(){
	var seconds_left = ( this.duration_in_seconds - this.time_elapsed );
	if( seconds_left <= 0 ) return '0:00';

	var minutes = Math.floor( seconds_left / 60 );
	var seconds = Math.floor( seconds_left - ( 60 * minutes ) );

	return minutes + ':' + JL.functions.pad( seconds, 2 );
};

JL.webgl.space_object.game.prototype.start = function(){
	this.time_elapsed = 0;
	this.prev_time = ( new Date() ).getTime();

	this.add_per_frame_function(function(){
		var curr_time = ( new Date() ).getTime();

		this.time_elapsed += ( curr_time - this.prev_time ) / 1000;

		this.prev_time = curr_time;

		JL.webgl.ui.item.scoreboard.update_time();

		if( this.time_elapsed >= this.duration_in_seconds ){
			this.remove_per_frame_functions({ _name : 'update_time' });
			this.end();
		}
	}, { _name : 'update_time' } );
};

JL.webgl.space_object.game.prototype.end = function(){
	this.is_game_over = true;
	JL.webgl.ui.item.scoreboard.show_game_over();
};

JL.webgl.space_object.game.prototype.select = function(){
	this.teams[0].players[0].select();
};
