	$(document).ready(function(){
	//sign
	var signDiv = document.getElementById('signDiv');
	var signDivUsername = document.getElementById('signDiv-username');
	var signDivSignIn = document.getElementById('signDiv-signIn');
	var signDivSignUp = document.getElementById('signDiv-signUp');
	var signDivPassword = document.getElementById('signDiv-password');
	var socket = window.socket;


	var panalesEscenarios = ['questionGame'];


	//Panel de preguntas


	signDivSignIn.onclick = function(){
		socket.emit('signIn',{username:signDivUsername.value,password:signDivPassword.value});
	}
	signDivSignUp.onclick = function(){
		modal.style.display = "block";
	}
	socket.on('signInResponse',function(data){
		if(data.success){
			signDiv.style.display = 'none';
			gameDiv.style.display = 'inline-block';
			//questionGame.style.display = 'inline-block';
		} else
			alert("Sign in unsuccessul.");
	});
	socket.on('signUpResponse',function(data){
		if(data.success){
			alert("Sign up successul.");
		} else
			alert("Sign up unsuccessul.");
	});

	$( "#singUpForm" ).submit(function( event ) {
		let params = {
			name:    $("#singUpForm input[name='name']").val(),
			date:    $("#singUpForm input[name='date']").val(),
			gender:  $("#singUpForm input[name='gender']").val(),
			username:$("#singUpForm input[name='username']").val(),
			pass:    $("#singUpForm input[name='pass']").val()

		}
		socket.emit('signUp',params);
		event.preventDefault();
	 });

	socket.on('panelEscenarios', function(data){
		var panelesAMostrar = data.paneles;
		for(var i = 0; i < panalesEscenarios.length; i++)
			document.getElementById(panalesEscenarios[i]).style.display = 'none';
		for(var i = 0; i < panelesAMostrar.length; i++)
			document.getElementById(panelesAMostrar[i]).style.display = 'inline-block';
	})

	// Get the modal
	var modal = document.getElementById("myModal");

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
	}
});	 