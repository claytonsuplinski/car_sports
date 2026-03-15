JL.webgl.variables.team_inputs = [
	{ key : 'team_size' , label : 'Team Size', type : 'int', ui_order : '0_c', default : 3, min : 1, max : 10 },
];

JL.webgl.space_object.team = JL.functions.inherit_class( function(){}, JL.webgl.space_object._regular, {
	_inputs_exclude : [ 'draw_xyz', 'is_impostor', ].map( key => ({ key }) ),
	_inputs : [
		...JL.webgl.variables.team_inputs,
		{ key : 'side' , type : 'int', default : 0, },
		{ key : 'color', type : 'arr', length : 3, structure : { type : 'float', min : 0, max : 1, default : 0, }, },
		// { key : 'on_finish', type : 'function' , optional : true, },
	]
} );

JL.webgl.space_object.team.prototype._on_init = function( p ){
	this.score = 0;

	this.players = [];

	this.color_str = this.color.map( c => Math.floor( c * 255 ) ).join(',');

	for( var _ = 0; _ < this.team_size; _++ ){
		var s_o_args = {
			parent_object : this,
			collider      : {
				mass             : 800,
				collision_filter : 'item',
			},
			ui_info : {
				scoreboard : { game : this.parent_object, },
			},
			ui_elements : [ 'scoreboard', ],
		};

		var player = this.environment.add_space_object( s_o_args, JL.webgl.space_object.player );
		this.players.push( player );

		var color_factor = this.color.slice().concat([ 0 ]);
		player.set_uniforms( 'frags_vec4', { color_factor, } );

		var max_color_idx = 0;
		var max_color_val = color_factor[0];
		for( var i = 1; i < 3; i++ ){
			if( max_color_val < color_factor[i] ){
				max_color_val = color_factor[i];
				max_color_idx = i;
			}
		}

		player.set_uniforms( 'frags_int' , { plain_rgba : max_color_idx, } );
	}
};

JL.webgl.space_object.team.prototype.reset_positions = function(){
	var deg_positions = [];
	if( this.team_size % 2 == 1 ){
		var deg_delta = 90 / ( this.team_size / 2 );
		for( var i = 0; i < this.team_size; i++ ) deg_positions.push( deg_delta * Math.ceil( i / 2 ) * ( i % 2 ? 1 : -1 ) );
	}
	else{
		var deg_delta = 180 / ( this.team_size + 1 );
		for( var i = 1; i < this.team_size + 1; i++ ) deg_positions.push( ( deg_delta * i ) - 90 );
	}

	deg_positions = JL.functions.shuffle_array( deg_positions );

	for( var i = 0; i < this.players.length; i++ ){
		var deg    = deg_positions[ i ];
		var player = this.players[  i ];

		var pos = JL.functions.spherical_to_cartesian( 0, deg, 15 );

		player.reset_physics();

		player.set_physics_position( pos.z * this.side, 0, pos.x );

		player.set_physics_rotation_euler([ [ 0, 180 + this.side * ( 90 - deg ), 0 ] ]);
	}
};

JL.webgl.space_object.team.prototype.increment_score = function( offset ){
	this.score += offset;
};
