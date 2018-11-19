var username, role;
function validate() {
	var username = document.getElementById("inputUsername").value.trim();
	var password = document.getElementById("inputPassword").value;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			response = JSON.parse(this.responseText);
			if(response["Login"] == "failed") {
				alert("Wrong username or password");
			}
			else if(response["Login"] == "succeed") {
				role = response["role"];
				if(response["role"] == 1)
					window.location.href = "student.html";
				else if(response["role"] == 0)
					window.location.href = "admin.html";
			}
		}
	}
	xhttp.open("POST", "login.php", true);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=validateUser&username=" + username + "&password=" +
			password);
}

function isLoggedIn() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			response = JSON.parse(this.responseText);
			var page = window.location.href.split("/").pop();
			if(response["Login"] == "succeed") {
				username = response['username'];
				role = response['role'];
				if(response["role"] == 0 && page != "admin.html")
					window.location.href = "admin.html";
				else if(response["role"] == 1 && page != "student.html")
					window.location.href = "student.html";
				/*if(response["role"] == 0 && page == "admin.html")
					document.getElementById("hidden-body").style.display = "block";
				else if(response["role"] == 1 && page == "student.html")
					document.getElementById("hidden-body").style.display = "block";*/
			}
			else if(response["Login"] == "failed" && page != "index.html") {
				window.location.href = "index.html";
			}
		}
	}
	xhttp.open("POST", "login.php", true);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=isLoggedIn");
}

function logout() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			response = JSON.parse(this.responseText);
			if(response["Logout"] == "succeed") {
				window.location.href = "index.html";
			}
			else
				alert("Unable to logout");
		}
	}
	xhttp.open("POST", "login.php", true);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=logout");
}
