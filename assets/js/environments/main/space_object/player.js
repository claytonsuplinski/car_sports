JL.webgl.space_object.player = JL.functions.inherit_class( function(){}, JL.webgl.space_object._car, {
	_inputs_exclude : [ 'draw_xyz', 'is_impostor', ].map( key => ({ key }) ),
	_inputs_assign : [
		{ path : [ 'graphics_object_wheel' ], value : { default : 'simple_car_wheel', } },
	],
	_inputs : [
		// { key : 'on_finish', type : 'function' , optional : true, },
	]
} );

JL.webgl.space_object.player.prototype.___on_init = function( p ){
	// TODO : test
	// this.add_per_frame_function(function(){ this.accelerate( 0.2 ); });

	p.graphics_objects = [ JL.webgl.graphics_objects.simple_car_body ];
};
