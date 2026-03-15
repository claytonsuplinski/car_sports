JL.webgl.ui.item.scoreboard = function( p ){
	this.init( p );
};

JL.webgl.ui.item.scoreboard.css = `
	.ui-scoreboard{
		position:fixed;
		top :10px;
		left:10px;
		background:#000;
		z-index:2;
	}

	.ui-scoreboard table{
		border-collapse:collapse;
	}

	.ui-scoreboard td{
		border:1px solid #999;
		background:#000;
		color:#eee;
	}

	.ui-scoreboard td.name{
		padding:0 10px;
		text-align:left;
	}

	.ui-scoreboard td.score{
		background:linear-gradient( #333, #000 );
		font-weight:700;
		width:40px;
		text-align:center;
	}

	.ui-scoreboard #scoreboard-time{
		background:linear-gradient( #333, #000 );
		font-weight:700;
		text-align:center;
	}

	.ui-game-over{
		display:none;
		background:rgba(0,0,0,0.8);
		position:fixed;
		top :0;
		left:0;
		width :100vw;
		height:100vh;
		z-index:1;
	}

	.ui-game-over .caption{
		position:fixed;
		top:0;
		left:0;
		right:0;
		bottom:0;
		margin:auto;
		padding:5px 0;
		text-align:center;
		width:100vw;
		height:26px;
		background:linear-gradient( 90deg, transparent, #933 10%, #339 90%, transparent );
		outline:1px solid #555;
		border-top   :2px solid #000;
		border-bottom:2px solid #000;
		color:#fff;
		font-size:24px;
		font-weight:700;
	}
`;

JL.webgl.ui.item.scoreboard.draw = function(){
	$( '.ui-scoreboard' ).html( '<table>' +
		this.ui_info.game.teams.map(function( team, t_i ){
			return '<tr>' +
				'<td class="name" style="background:linear-gradient( rgba(' + team.color_str + ', 0.5 ), rgba(' + team.color_str + ', 0.75 ) );">' + 
					team.name +
				'</td>' + 
				'<td class="score">' + team.score + '</td>' +
			'</tr>';
		}).join('') +
		'<tr>' + 
			'<td colspan="2" id="scoreboard-time">&nbsp;</td>' +
		'</tr>' +
	'</table>' );

	this.scoreboard_time_ele = $( '.ui-scoreboard #scoreboard-time' );

	this.update_time();
};

JL.webgl.ui.item.scoreboard.show_game_over = function(){
	$( '.ui-game-over' ).show( 'fade', 200 );
};

JL.webgl.ui.item.scoreboard.update_time = function(){
	this.scoreboard_time_ele.html( this.ui_info.game.get_hr_time() );
};

JL.webgl.ui.item.scoreboard.ui_framework = function(){
	return '<div class="ui-scoreboard"></div>' + 
		'<div class="ui-game-over">' + 
			'<div class="caption">GAME OVER</div>' +
		'</div>';
};

JL.webgl.ui.item.scoreboard.ui_onselect = function(){
        var _this = JL.webgl.ui.item.scoreboard;

	_this.self = this;

        _this.ui_info = this.ui_info.scoreboard;

	_this.draw();
};
