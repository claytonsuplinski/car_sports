JL.webgl.ui.item.landing = function( p ){
	this.init( p );
};

JL.webgl.ui.item.landing.css = `
	.ui-landing{
		position:fixed;
		top:0;
		left:0;
		width :100vw;
		height:100vh;
		background:linear-gradient( 90deg, #000, transparent 50% );
		padding-top:20px;
		text-align:left;
	}

	.ui-landing .option{
		background:#333;
		width:100px;
		margin-top :10px;
		margin-left:30px;
		padding:7px 10px;
		text-align:center;
		color:#ddd;
		border:1px solid rgba(255,255,255,0.25);
		cursor:pointer;
	}

	.ui-landing .option:hover{
		background:#2e5373;
	}

	.ui-landing .jl-json-edit td.lbl{
		width:150px;
	}
`;

JL.webgl.ui.item.landing.ui_framework = function(){
	return '<div class="ui-landing">' + 
		'<div id="landing-settings"></div>' +
		'<div class="option" onclick="JL.webgl.functions.load_and_select_environment({ keys : [ JL.webgl.variables.game.game_type ] });">Start Game</div>' +
	'</div>';
};

JL.webgl.ui.item.landing.ui_onselect = function(){
        var _this = JL.webgl.ui.item.landing;

        if( !JL.webgl.variables.game ) JL.webgl.variables.game = {};

	new JL.json_edit({
		parent    : { id : '#landing-settings' },
		value     : JL.webgl.variables.game,
		structure : JL.webgl.variables.game_inputs.slice(),
	});
};
