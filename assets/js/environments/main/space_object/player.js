JL.webgl.space_object.player = JL.functions.inherit_class( function(){}, JL.webgl.space_object._car, {
	_inputs_exclude : [ 'draw_xyz', 'is_impostor', ].map( key => ({ key }) ),
	_inputs_assign : [
		{ path : [ 'graphics_object_wheel' ], value : { default : 'simple_car_wheel', } },
	],
	_inputs : [
		{ key : 'is_user', type : 'bool', },
		// { key : 'on_finish', type : 'function' , optional : true, },
	]
} );

JL.webgl.space_object.player.prototype.___on_init = function( p ){
	if( !this.is_user ){
		this.add_per_frame_function(function(){ this.cpu_drive(); });
	}

	p.graphics_objects = [ JL.webgl.graphics_objects.simple_car_body ];
};

JL.webgl.space_object.player.prototype.cpu_drive = function(){
	this.drive_toward_point({
		point : this.parent_object.parent_object.ball.get_position(),
	});
};
