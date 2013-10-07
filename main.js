$(document).ready(function(){
	
	$('#edit_input').ieditable('http://localhost/save',{
		indicator:'saving',
		tooltip:'click to edit',
		onblur:'submit'
	});
	
});