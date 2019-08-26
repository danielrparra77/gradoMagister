$(document).ready(function(){
	//chat
	var chatText = document.getElementById('chat-text');
	var chatInput = document.getElementById('chat-input');
	var chatForm = document.getElementById('chat-form');
	var socket = window.socket;
	
	socket.on('addToChat',function(data){
		chatText.innerHTML += '<div>' + data + '</div>';
	});
	socket.on('evalAnswer',function(data){
		console.log(data);
	});
	
	
	chatForm.onsubmit = function(e){
		e.preventDefault();
		if(chatInput.value[0] === '/')
			socket.emit('evalServer',chatInput.value.slice(1));
		else if(chatInput.value[0] === '@'){
			//@username,message
			socket.emit('sendPmToServer',{
				username:chatInput.value.slice(1,chatInput.value.indexOf(',')),
				message:chatInput.value.slice(chatInput.value.indexOf(',') + 1)
			});
		} else
			socket.emit('sendMsgToServer',chatInput.value);
		chatInput.value = '';		
	}
});	 