JL.webgl.init({
	attr : {
		load : {
			groups : {
				"Shared": {
					steps : [
						{
							init : function(callback){
								JL.webgl.load.graphics_objects_list( this, [
									{
										params : {
											"_type"      : "cube",
											"x"          : 0.6,
											"y"          : 0.6,
											"z"          : 1,
											"label"      : [ "simple_car_body" ],
											"properties" : { "effects" : [ "_plain_rgba", "_color_add", "_color_factor", ] },
											"transforms" : [{ "y" : 0.3, "type" : "translate" }],
											"attr"       : {
												"frags_int"  : { "plain_rgba" : 0, },
												"frags_vec4" : { "color_add"  : [ 0.2, 0.2, 0.2, 0 ] },
											},
											"textures"   : [{ "filename" : "./assets/textures/seamless/sci_fi_patterns/circuits_05.jpg" }]
										},
									},
									{
										params : {
											"_type"      : "cylinder",
											"height"     : 0.25,
											"rad_bot"    : 0.5,
											"rad_top"    : 0.5,
											"num_slices" : 12,
											"keys"       : [ "_default_wheel" ],
											"label"      : [ "simple_car_wheel" ],
											"textures"   : [{ "filename" : "./assets/textures/seamless/sci_fi_patterns/circuits_05.jpg" }],
											"transforms" : [
												{ "val" : 90, "axis" : "x", "type" : "rotate" },
												{ "val" : 90, "axis" : "y", "type" : "rotate" }
											]
										}
									},
									{
										params : {
											"_type"      : "sphere",
											"radius"     : 0.5,
											"label"      : [ "game_ball" ],
											"properties" : { "effects" : [ "_color_add", "_color_factor", ] },
											"attr"       : {
												"frags_vec4" : { "color_add"  : [ 0.2, 0.2, 0.2, 0 ] },
											},
											"textures"   : [{ "filename" : "./assets/textures/seamless/geometric_patterns/052.jpg" }]
										},
									},
									{
										params : {
											"_type"      : "cylinder",
											"height"     : 0.125,
											"rad_bot"    : 0.5,
											"rad_top"    : 0.5,
											"num_slices" : 24,
											"label"      : [ "game_puck" ],
											"properties" : { "effects" : [ "_color_add", "_color_factor", ] },
											"attr"       : {
												"frags_vec4" : { "color_add"  : [ 0.2, 0.2, 0.2, 0 ] },
											},
											"textures"   : [{ "filename" : "./assets/textures/seamless/geometric_patterns/052.jpg" }]
										},
									},
									{
										params : {
											"_type"      : "cube",
											"x"          : 0.5,
											"y"          : 0.1,
											"z"          : 0.5,
											"label"      : [ "floor_tile" ],
											"properties" : { "effects" : [ "_color_add", ] },
											"attr"       : {
												"frags_vec4" : { "color_add"  : [ 0.2, 0.2, 0.2, 0 ] },
											},
											"textures"   : [{ "filename" : "./assets/textures/seamless/geometric_patterns/002.jpg" }]
										},
									},
								]);
								callback();
							}
						},
					],
					scripts : [
						"./assets/js/environments/main/space_object/player.js",
						"./assets/js/environments/main/space_object/team.js",
						"./assets/js/environments/main/space_object/game.js",

						"./assets/js/environments/main/ui/landing.js",
						"./assets/js/environments/main/ui/scoreboard.js",
					],
				}
			},
		},
		variables : {
			default_background   : '_default',
			default_key_bindings : [ 'mouse', 'reset' ],
		},
	},
	controllers : {},
	hashlinks   : {
		params : {
			record : {},
		},
	},
	keyboard    : {
		bindings : {
			gold_character : [
				{ name : "A", controllers : { ps4 : 'Control Pad Left'  }, down : function(){ JL.webgl.active_camera.target.turn(-1); } },
				{ name : "D", controllers : { ps4 : 'Control Pad Right' }, down : function(){ JL.webgl.active_camera.target.turn( 1); } },
				{ name : "W", controllers : { ps4 : 'Control Pad Up'    }, hold : function(){ JL.webgl.active_camera.target.walk( 1); } },
				{ name : "S", controllers : { ps4 : 'Control Pad Down'  }, hold : function(){ JL.webgl.active_camera.target.walk(-1); } },
			],
		},
	},
	mouse       : {},
	environment : {
		custom_functions : {
			on_load : function(){
				try{ JL.webgl.device.options.vr.loading_background.hide(); } catch(e){}
			},
			pre_instantiate : function(){
				this.on_pause = function(){
					JL.webgl.ui.key_bindings.disable();
					if( JL.webgl.ui.mouse ) JL.webgl.ui.mouse.disable();
				};

				this.on_resume = function(){
					JL.webgl.ui.key_bindings.enable();
					if( JL.webgl.ui.mouse ) JL.webgl.ui.mouse.enable();
				};
			},
		}
	},
	load : {
		custom_functions : {
			assets_on_start : function( p ){
				try{ JL.webgl.device.options.vr.loading_background.show(); } catch(e){}
				JL.webgl.ui.intermediate_loading.show();
				p.callback();
			},
			assets_on_finish : function(){
				JL.webgl.ui.intermediate_loading.hide();
			},
		},
	},
});

window.onhashchange = function(){ JL.webgl.hashlinks.start(); window.location.reload(); };
// window.onload       = function(){ JL.webgl.hashlinks.start(); };
