"use strict";
var currElement = null;
var currMenu = null;
var eligibleScholarships = null;
var scholarshipNames = null;
var profile = null;
var scholarshipApplication = null;
var eligibleScDT = null;
var profileAction = null;
var branch = null;
var year = null;
var gender = null;
var selectPicker = false;

function displayElement(el) {
	if(currElement != null)
		currElement.style.display = "none";
	el.style.display = "block";
	currElement = el;
	$(".popover").popover('dispose');
	removeClass(el, "is-invalid");
}

function getProfile(async) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			profile = JSON.parse(this.responseText);
			if(profile["profile"] !== "empty")
				document.getElementById("suserName").innerHTML = profile["firstname"] + " " + profile["lastname"];
		}
	}
	xhttp.open("POST", "student.php", async);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=getProfile");
}

function displayProfile() {
	currMenu.classList.remove("active");
	arguments[0].classList.add("active");
	currMenu = arguments[0];

	var el = document.getElementById("profile");
	displayElement(el);
	document.getElementById("mis").value = username;
	document.getElementById("mis").disabled = true;
	document.getElementById("alert-box-profile").innerHTML = "";
	if(profile["profile"] == "empty") {
		document.getElementById("alert-box-profile").innerHTML = "<div class=\"alert alert-danger alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Complete your profile to stay updated.</div>";
		document.getElementById("firstName").value = "";
		document.getElementById("lastName").value = "";
		document.getElementById("profile-class").value = "-1";
		document.getElementById("profile-cgpa").value = "";
		document.getElementById("profile-gender").value = "-1";
		document.getElementById("profile-branch").value = "-1";
		document.getElementById("profile-contactNo").value = "";
		profileAction = "insert";
	}
	else {
		document.getElementById("firstName").value = profile['firstname'];
		document.getElementById("lastName").value = profile['lastname'];
		document.getElementById("profile-class").value = profile['year'];
		document.getElementById("profile-cgpa").value = profile['cgpa'];
		document.getElementById("profile-gender").value = profile['gender'];
		document.getElementById("profile-branch").value = profile['branch'];
		document.getElementById("profile-contactNo").value = profile['contactNo'];
		profileAction = "update";
	}
}
function removeClass(el, cls) {
	var els = el.getElementsByClassName(cls);
	for(var x = 0;x < els.length;x++)
		els[x].classList.remove("is-invalid");
}

function saveProfile() {
	var firstName = inputTagEmpty("firstName", "Enter First Name");
	if(!firstName)
		return;
	var lastName = inputTagEmpty("lastName", "Enter Last Name");
	if(!lastName)
		return;
	var cgpa = validateFloatingValues("profile-cgpa", "Enter valid cgpa", 0, 10);
	if(!cgpa)
		return;
	if(selectTagEmpty("profile-gender"))
		return;
	var gender = document.getElementById("profile-gender").value;
	if(selectTagEmpty("profile-class"))
		return;
	var year = document.getElementById("profile-class").value;
	if(selectTagEmpty("profile-branch"))
		return;
	var branch = document.getElementById("profile-branch").value;
	var contactNo = validateFloatingValues("profile-contactNo", "Enter valid contact No", 1000000000, 9999999999);
	if(!contactNo)
		return;

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(this.responseText);
			if(response["update"] == "failed") {
				document.getElementById("alert-box-profile").innerHTML = "<div class=\"alert alert-danger alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Update profile : <b>Failed</b>.<br>Please try again later</div>";
			}
			else if(response["update"] == "succeed") {
				getProfile(false);
				document.getElementById("alert-box-profile").innerHTML = "<div class=\"alert alert-success alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Profile updated successfully.<br>Now you can view eligible scholarships</div>";
			}
		}
	}
	xhttp.open("POST", "student.php", true);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=saveProfile&firstName=" + firstName + "&lastName=" + lastName + "&cgpa=" + cgpa + "&gender=" + gender + "&year=" + year + "&branch=" + branch + "&contactNo=" + contactNo + "&action=" + profileAction);
}

function getEligibleScholarships(async) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			eligibleScholarships = JSON.parse(this.responseText);
		}
	}
	xhttp.open("POST", "student.php", async);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=getEligibleScholarships");
}

function displayEligibleScholarships() {
	if(currMenu != null)
		currMenu.classList.remove("active");
	arguments[0].classList.add("active");
	currMenu = arguments[0];
	if(eligibleScholarships["profile"] == "empty") {
		displayProfile(document.getElementById("menu4").parentElement);
		document.getElementById("alert-box-profile").innerHTML = "<div class=\"alert alert-danger alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Please complete your profile to view scholarships.</div>";
		return;
	}
	var el = document.getElementById("eligible-scholarships");
	displayElement(el);

	var table = document.getElementById("eligibleScTable");
	if(eligibleScDT !== null)
		eligibleScDT.destroy();
	table.innerHTML = "";
	var thead = document.createElement("thead");
	table.appendChild(thead);
	var tr = document.createElement("tr");
	thead.appendChild(tr);
	
	var headerRow = ["Sr.No.", "Scholarship Name", "Scholarship Type", "Amount", "Last Date Of Application", "Action"];
	var cellWidth = [30, 170, 400, 70, 150, 30]
	for(var j = 0; j < headerRow.length; j++) {
		var th = document.createElement("th");
		th.style.width = cellWidth[j] + 'px';
		tr.appendChild(th);
		var tc = document.createTextNode(headerRow[j]);
		th.appendChild(tc);
	}

	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	for(var i = 0;i < eligibleScholarships.length;i++) {
		tr = document.createElement("tr");
		tbody.appendChild(tr);
		createTextNode(tr, cellWidth[0], i + 1);
		createTextNode(tr, cellWidth[1], eligibleScholarships[i]['sName']);
		createTextNode(tr, cellWidth[2], eligibleScholarships[i]['sType']);
		createTextNode(tr, cellWidth[5], eligibleScholarships[i]['amount']);
		createTextNode(tr, cellWidth[6], eligibleScholarships[i]['lastDateOfApplication']);
		var td = document.createElement("td");
		td.innerHTML = "<button type=\"button\" data-toggle=\"modal\" data-target=\"#eligibleScModal\" onclick=\"viewDetails("+ eligibleScholarships[i]['sId'] +")\">Details</button>";
		tr.appendChild(td);
	}
	eligibleScDT = $("#eligibleScTable").DataTable();
}

function createTextNode(tr, width, text) {
	var td = document.createElement("td");
	td.style.width = width + 'px';
	tr.appendChild(td);
	var center = document.createElement("center");
	td.appendChild(center);
	var tc = document.createTextNode(text);
	center.appendChild(tc);
}

function contactAdmin() {
	currMenu.classList.remove("active");
	arguments[0].classList.add("active");
	currMenu = arguments[0];
	
	var el = document.getElementById("contactAdmin");
	displayElement(el);
	document.getElementById("contactAdminSubject").value = "";
	document.getElementById("contactAdminMessage").value = "";
	document.getElementById("alertMessageAdmin").innerHTML = "";
}

function adminMessage() {
	var subject = inputTagEmpty("contactAdminSubject", "Subject can't be empty");
	if(!subject)
		return;
	var message = inputTagEmpty("contactAdminMessage", "Message body can't be empty");
	if(!message)
		return;
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(this.responseText);
			if(response["insert"] == "succeed") {
				document.getElementById("alertMessageAdmin").innerHTML = "<div class=\"alert alert-success alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Message has been sent.</div>";
			}
			else if(response["insert"] == "failed") {
				document.getElementById("alertMessageAdmin").innerHTML = "<div class=\"alert alert-danger alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Message has not been sent.Please try again later.</div>";
			}
			document.getElementById("contactAdminSubject").value = "";
			document.getElementById("contactAdminMessage").value = "";
		}
	}
	xhttp.open("POST", "student.php", true);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=insertAdminMessage&subject=" + subject + "&message=" + message);
}

function getApplication(async) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			scholarshipApplication = JSON.parse(this.responseText);
			if(scholarshipApplication["application"] === "exists" && eligibleScholarships.length === 0) {
				var Xhttp = new XMLHttpRequest();
				Xhttp.onreadystatechange = function () {
					if(this.readyState == 4 && this.status == 200) {
						scholarshipNames = JSON.parse(this.responseText);
					}
				}
				Xhttp.open("POST", "student.php", false);
				Xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				Xhttp.send("reqType=getScholarshipNames&aId=" + scholarshipApplication["row"]["aId"]);
			}
		}
	}
	xhttp.open("POST", "student.php", async);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=checkApplicationStatus");
}

function createOptionTag(value, text) {
	var option = document.createElement("option");
	option.value = value;
	option.innerHTML = text;
	return option;
}
function fillSelectTag(id, table, start) {
	var el = document.getElementById(id);
	el.innerHTML = "";
	el.appendChild(createOptionTag("-1", ""));
	for(var i = start;i < table.length;i++)
		el.appendChild(createOptionTag("" + i, table[i]));
	el.value = "-1";
}

function getCodeTables(async) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(this.responseText);
			branch = response["branch"];
			year = response["year"];
			gender = response["gender"];
		}
	}
	xhttp.open("POST", "student.php", async);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=getCodeTables");
}

function displayApplication() {
	currMenu.classList.remove("active");
	arguments[0].classList.add("active");
	currMenu = arguments[0];
	var el = document.getElementById("applyForScholarship");
	displayElement(el);
	document.getElementById("sFormAlert").innerHTML = "";
	if(scholarshipApplication["application"] == "exists") {
		var status = scholarshipApplication["row"]["status"];
		if(status == 2 || status == 3) {// status 2 is "submitted" and status 3 is "accepted"
			document.getElementById("applicationSubmit").style.display = "none";
			document.getElementById("applicationPrint").style.display = "inline-block";
			document.getElementById("applicationSave").style.display = "none";
		}
		else {
			document.getElementById("applicationSubmit").style.display = "inline-block";
			document.getElementById("applicationPrint").style.display = "none";
			document.getElementById("applicationSave").style.display = "inline-block";
		}
		document.getElementById("fullName").value = scholarshipApplication['row']['fullName'];
		document.getElementById("dob").value = scholarshipApplication['row']['DOB'];
		document.getElementById("cAdd").value = scholarshipApplication['row']['localAddr'];
		document.getElementById("pAdd").value = scholarshipApplication['row']['permanantAddr'];
		document.getElementById("class").value = profile["year"];
		document.getElementById("branch").value = profile["branch"];
		document.getElementById("class").disabled = true;
		document.getElementById("branch").disabled = true;
		document.getElementById("email").value = scholarshipApplication['row']['email'];
		document.getElementById("contactNo").value = scholarshipApplication['row']['contactNo'];
		document.getElementById("marksSSC").value = scholarshipApplication['row']['markSSC'];
		document.getElementById("marksHSC").value = scholarshipApplication['row']['markHSC'];
		document.getElementById("marksCompet").value = scholarshipApplication['row']['markCompet'];
		document.getElementById("cpi").value = scholarshipApplication['row']['cpi'];
		document.getElementById("spi").value = scholarshipApplication['row']['spi'];
		document.getElementById("annualIncome").value = scholarshipApplication['row']['annualIncome'];
		document.getElementById("incomeSource").value = scholarshipApplication['row']['incomeSource'];
		document.getElementById("familyBrothers").value = scholarshipApplication['row']['familyBrothers'];
		document.getElementById("familySisters").value = scholarshipApplication['row']['familySisters'];
		document.getElementById("familyMembers").value = scholarshipApplication['row']['familyMembers'];
		document.getElementById("brothersEducation").value = scholarshipApplication['row']['brothersEducation'];
		document.getElementById("sistersEducation").value = scholarshipApplication['row']['sistersEducation'];
		document.getElementById("immovableProperty").value = scholarshipApplication['row']['immovableProperty'];
		document.getElementById("otherBenefits").value = scholarshipApplication['row']['otherBenefits'];
		document.getElementById("finReq").value = scholarshipApplication['row']['finReq'];
		document.getElementById("achievements").value = scholarshipApplication['row']['achievements'];
		if(selectPicker === true)
			$("#sName").selectpicker("destroy");
		sName = document.getElementById("sName");
		sName.innerHTML = "";
		var scholarships = eligibleScholarships;
		if(eligibleScholarships.length === 0) {
			scholarships = scholarshipNames;
		}
		for(var i = 0;i < scholarships.length;i++) {
			var opt = document.createElement("option");
			opt.value = scholarships[i]['sId'];
			var text = document.createTextNode(scholarships[i]['sName']);
			opt.appendChild(text);
			sName.appendChild(opt);
		}
		var sApplication = [];
		for(var i = 0;i < scholarshipApplication["row"]["sName"].length;i++)
			sApplication.push(scholarshipApplication["row"]["sName"][i]["sId"]);
		$("#sName").selectpicker("val",sApplication);
		selectPicker = true;
		addDownloadLink("passportPhotoDiv", "downloadPassportPhoto", scholarshipApplication["row"]["passportPhoto"], false, );
		addDownloadLink("signatureDiv", "downloadsignature", scholarshipApplication["row"]["signature"], false);
		addDownloadLink("SSCMarksheetDiv", "downloadSSCMarksheet", scholarshipApplication["row"]["SSCMarksheet"], false);
		addDownloadLink("HSCMarksheetDiv", "downloadHSCMarksheet", scholarshipApplication["row"]["HSCMarksheet"], false);
		addDownloadLink("competMarksheetDiv", "downloadcompetMarksheet", scholarshipApplication["row"]["competMarksheet"], false);
		addDownloadLink("incomeCertDiv", "downloadincomeCert", scholarshipApplication["row"]["incomeCert"], false);
		addDownloadLink("admitCardDiv", "downloadadmitCard", scholarshipApplication["row"]["admitCard"], false);
		addDownloadLink("ecActDiv", "downloadecAct", scholarshipApplication["row"]["ecAct"], true);
		if(status == 2)
			document.getElementById("sFormAlert").innerHTML = "<div class=\"alert alert-danger alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>You have already submitted scholarship application.</div>";
	}
	else if(scholarshipApplication["application"] == "notExists") {
		document.getElementById("fullName").value = "";
		document.getElementById("dob").value = "";
		document.getElementById("cAdd").value = "";
		document.getElementById("pAdd").value = "";
		document.getElementById("email").value = "";
		document.getElementById("contactNo").value = "";
		document.getElementById("marksSSC").value = "";
		document.getElementById("marksHSC").value = "";
		document.getElementById("marksCompet").value = "";
		document.getElementById("cpi").value = "";
		document.getElementById("spi").value = "";
		document.getElementById("annualIncome").value = "";
		document.getElementById("incomeSource").value = "";
		document.getElementById("familyBrothers").value = "";
		document.getElementById("familySisters").value = "";
		document.getElementById("familyMembers").value = "";
		document.getElementById("brothersEducation").value = "";
		document.getElementById("sistersEducation").value = "";
		document.getElementById("immovableProperty").value = "";
		document.getElementById("otherBenefits").value = "";
		document.getElementById("finReq").value = "";
		document.getElementById("achievements").value = "";
		document.getElementById("passportPhoto").value = "";
		document.getElementById("signature").value = "";
		document.getElementById("SSCMarksheet").value = "";
		document.getElementById("HSCMarksheet").value = "";
		document.getElementById("competMarksheet").value = "";
		document.getElementById("admitCard").value = "";
		document.getElementById("incomeCert").value = "";
		document.getElementById("ecAct").value = "";
		document.getElementById("applicationPrint").style.display = "none";
		document.getElementById("applicationSave").style.display = "inline-block";
		document.getElementById("applicationSubmit").style.display = "inline-block";
		sName = document.getElementById("sName");
		if(profile['profile'] === 'empty') {
			document.getElementById("class").value = "";
			document.getElementById("branch").value = "";
			document.getElementById("applicationSubmit").style.display = "none";
			document.getElementById("applicationSave").style.display = "none";
			document.getElementById("sFormAlert").innerHTML = "<div class=\"alert alert-danger alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>complete your profile to apply for scholarship.</div>";
		}
		else {
			document.getElementById("class").value = profile["year"];
			document.getElementById("branch").value = profile["branch"];
			document.getElementById("class").disabled = true;
			document.getElementById("branch").disabled = true;
			document.getElementById("applicationSubmit").disabled = false;
			if(selectPicker === true)
				$("#sName").selectpicker("destroy");
			document.getElementById("sName").innerHTML = "";
			for(i = 0;i < eligibleScholarships.length;i++) {
				var opt = document.createElement("option");
				opt.value = eligibleScholarships[i]['sId'];
				var text = document.createTextNode(eligibleScholarships[i]['sName']);
				opt.appendChild(text);
				sName.appendChild(opt);
			}
			var val = [];
			if(arguments[1] !== undefined)
				val.push(arguments[1]);
			$("#sName").selectpicker("val", val);
			selectPicker = true;
		}
	}
	else if(eligibleScholarships.length === 0 ) {
		document.getElementById("applicationSubmit").style.display = "none";
		document.getElementById("applicationSave").style.display = "none";
		//$("#applyForScholarship input").prop("disabled", true);
		//$("#applyForScholarship textarea").prop("disabled", true);
		document.getElementById("sFormAlert").innerHTML = "<div class=\"alert alert-danger alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>You are not eligible for any scholarship.</div>";
		return;
	}
}
function addDownloadLink(parent, id, path, isMultiple) {
	if(path.length === 0)
		return;
	if(isMultiple === true) {
		var token = 1;
		var childs = document.getElementById(parent).getElementsByTagName("a");
		while(childs.length !== 0)
			childs[0].parentElement.removeChild(childs[0]);
	}
	else
		var token = "";
	for(var i = 0;i < path.length;i++) {
		var link = document.getElementById(id + token);
		if(link === null) {
			link = document.createElement("a");
			link.target = "_blank";
			link.setAttribute("id", id + token);
			link.innerHTML = "<i class=\"fa fa-paperclip\"></i>Download";
		}
		link.href = path[i];
		document.getElementById(parent).appendChild(link);
		token++;
	}
	if(scholarshipApplication["row"]["status"] == 2 || scholarshipApplication["row"]["status"] == 3)
		document.getElementById(parent).getElementsByTagName("input")[0].style.display = "none";
	else
		document.getElementById(parent).getElementsByTagName("input")[0].style.display = "inline-block";
}

function checkFileValidty(status, id, maxSize, name, extensions) {
	var doc = document.getElementById(id);
	if(doc.files.length === 0) {
		if(status === 1)
			return true;
		alert("please attach " + name + "\n Max Size " + maxSize + " MB \n Allowed Formats " +  extensions.join(", "));
		return false;
	}
	for(var i = 0;i < doc.files.length;i++) {
		var type = doc.files[i]['type'].split("/").pop();
		if(doc.files[i]['size'] > 1048576 * parseInt(maxSize)) {
			alert("Maximun allowed size for " + name + " is " + maxSize + "MB");
			return false;
		}
		else {
			var typeMatch = false;
			for(var j = 0;j < extensions.length;j++)
				if(type === extensions[j]) {
					typeMatch = true;
					break;
				}
			if(typeMatch === false) {
				alert("Allowed attachment formats for " + name + " are " + extensions.join(", "));
				return false;
			}
		}
	}
	return true;
}

function printApplication(aId) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(this.responseText);
			if(response["success"] === true) {
				window.open(response["path"], "_blank");
			}
			/*var blob = this.response;
			var headers = this.getAllResponseHeaders();
			var fileName = this.getResponseHeader("filename");
			var a = document.createElement("a");
			a.mozSrcObject = blob;
			//a.href=window.URL.createObjectURL(blob);
			a.download=fileName;
			a.style.display = 'none';
			document.body.appendChild(a);
			a.click();*/
		}
	}
	xhttp.open("POST", "export.php", false);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("aId=" + aId);
}

function submitApplication(status) {
	var fullName = inputTagEmpty("fullName", "Enter Full Name", 2, status);
	if(status !== 1 && !fullName)
		return;
	var dob = inputTagEmpty("dob", "Enter valid Date", 1, status);
	if(status !== 1 && !dob)
		return;
	var localAddr = inputTagEmpty("cAdd", "Enter Local Address", 1, status);
	if(status !== 1 && !localAddr)
		return;
	var permanantAddr = inputTagEmpty("pAdd", "Enter Permanant Address", 1, status);
	if(status !== 1 && !permanantAddr)
		return;
	var email = inputTagEmpty("email", "Enter email address", 1, status);
	if(status !== 1 && !email)
		return;
	var contactNo = validateFloatingValues("contactNo", "Invalid contact No", 1000000000, 99999999999, status);
	if(status !== 1 && !contactNo)
		return;
	var marksSSC = validateFloatingValues("marksSSC", "Enter correct percentage", 0, 100, status);
	if(status !== 1 && !marksSSC)
		return;
	var marksHSC = validateFloatingValues("marksHSC", "Enter correct percentage", 0, 100, status);
	if(status !== 1 && !marksHSC)
		return;
	var marksCompet = validateFloatingValues("marksCompet", "Enter correct Marks", 0, null, status);
	if(status !== 1 && !marksCompet)
		return;
	/*var cpi = validateFloatingValues("cpi", "Enter correct CPI", 0, 10);
	if(!cpi)
		return;
	var spi = validateFloatingValues("spi", "Enter correct SPI", 0, 10);
	if(!spi)
		return;*/
	var annualIncome = validateFloatingValues("annualIncome", "Enter correct annual Income", 0, null, status);
	if(status !== 1 && !annualIncome)
		return;
	var incomeSource = inputTagEmpty("incomeSource", "Enter income source",1 , status);
	if(status !== 1 && !incomeSource)
		return;
	var fbrothers = validateFloatingValues("familyBrothers", "Enter valid number", 0, null, status);
	if(status !== 1 && !fbrothers)
		return;
	var fsisters = validateFloatingValues("familySisters", "Enter valid number", 0, null, status);
	if(status !== 1 && !fsisters)
		return;
	var fmembers = validateFloatingValues("familyMembers", "Enter valid number", 0, null, status);
	if(status !== 1 && !fmembers)
		return;
	if(fbrothers >= 1) {
		var brothersEdu = inputTagEmpty("brothersEducation", "Enter valid Details", 1, status);
		if(status !== 1 && !brothersEdu)
			return;
	}
	else {
		var brothersEdu = "";
		if(status === 1)
			var brothersEdu = document.getElementById("brothersEducation").value;
	}
	if(fsisters >= 1) {
		var sistersEdu = inputTagEmpty("sistersEducation", "Enter valid Details", 1, status);
		if(status !== 1 && !sistersEdu)
			return;
	}
	else {
		var sistersEdu = "";
		if(status === 1)
			sistersEdu = document.getElementById("sistersEducation").value;
	}
	var immovableProperty = inputTagEmpty("immovableProperty", "Enter valid Details", 1, status);
	if(status !== 1 && !immovableProperty)
		return;
	var otherBenefits = inputTagEmpty("otherBenefits", "Enter valid Details", 1, status);
	if(status !== 1 && !otherBenefits)
		return;
	var finReq = inputTagEmpty("finReq", "Enter valid Details", 1, status);
	if(status !== 1 && !finReq)
		return;
	var achievements = inputTagEmpty("achievements", "Enter valid Details", 1, status);
	if(status !== 1 && !achievements)
		return;
	if(status !== 1)
		if(selectTagEmpty("sName"))
			return;
	if(!checkFileValidty(status, "passportPhoto", 3, "Passport Photo", ["jpeg", "png", "jpg"]))
		return;
	if(!checkFileValidty(status, "signature", 3, "Signature", ["jpeg", "png", "jpg"]))
		return;
	if(!checkFileValidty(status, "SSCMarksheet", 3, "SSC Marksheet", ["jpeg", "png", "jpg"]))
		return;
	if(!checkFileValidty(status, "HSCMarksheet", 3, "HSC Marksheet", ["jpeg", "png", "jpg"]))
		return;
	if(!checkFileValidty(status, "competMarksheet", 3, "AIEEE/CET/DIPLOMA Marksheet", ["jpeg", "png", "jpg"]))
		return;
	if(!checkFileValidty(status, "admitCard", 3, "Admit card at COEP", ["jpeg", "png", "jpg"]))
		return;
	if(!checkFileValidty(status, "incomeCert", 3, "income certificate", ["jpeg", "png", "jpg"]))
		return;
	if(!checkFileValidty(status, "ecAct", 3, "extra curricular certificates", ["jpeg", "png", "jpg"]))
		return;
	if(status !== 1) {
		var reply = confirm("Once submitted the application can't be changed \n Do you want to submit the applicaton ?");
		if (reply == false)
			return;
	}
	var data = new FormData();
	data.append("reqType", "submitApplication");
	data.append("fullName", fullName);
	data.append("dob", dob);
	data.append("localAddr", localAddr);
	data.append("permananatAddr", permanantAddr);
	data.append("email", email);
	data.append("contactNo", contactNo);
	data.append("class", document.getElementById("class").value);
	data.append("branch", document.getElementById("branch").value);
	data.append("marksSSC", marksSSC);
	data.append("marksHSC", marksHSC);
	data.append("marksCompet", marksCompet);
	data.append("cpi", document.getElementById("cpi").value);
	data.append("spi", document.getElementById("spi").value);
	data.append("annualIncome", annualIncome);
	data.append("incomeSource", incomeSource);
	data.append("fbrothers", fbrothers);
	data.append("fmembers", fmembers);
	data.append("fsisters", fsisters);
	data.append("brothersEdu", brothersEdu);
	data.append("sistersEdu", sistersEdu);
	data.append("immovableProperty", immovableProperty);
	data.append("otherBenefits", otherBenefits);
	data.append("finReq", finReq);
	data.append("achievements", achievements);
	data.append("sName", JSON.stringify($("#sName").val()));
	addFileToData("passportPhoto", data, 0);
	addFileToData("signature", data, 0);
	addFileToData("SSCMarksheet", data, 0);
	addFileToData("HSCMarksheet", data, 0);
	addFileToData("competMarksheet", data, 0);
	addFileToData("admitCard", data, 0);
	addFileToData("incomeCert", data, 0);
	addFileToData("ecAct", data, 1);
	data.append("status", status);
	if(scholarshipApplication["application"] === "exists")
		data.append("aId", scholarshipApplication["row"]["aId"]);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(this.responseText);
			if(response["application"] === "submitted") {
				getApplication(false);
				displayApplication(document.getElementById("menu2").parentElement);
				if(status === 2) {
					document.getElementById("sFormAlert").innerHTML = "<div class=\"alert alert-success alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Application has been submitted successfully.</div>";
					document.getElementById("applicationSubmit").style.display = "none";
					document.getElementById("applicationSave").style.display = "none";
					document.getElementById("applicationPrint").style.display = "inline-block";
					document.getElementById("applicationPrint").onclick = function () {printApplication(scholarshipApplication["row"]["aId"]);};
				}
				if(status === 1) {
					document.getElementById("sFormAlert").innerHTML = "<div class=\"alert alert-success alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Application has been saved successfully.</div>";
				}
			}
			else
				document.getElementById("sFormAlert").innerHTML = "<div class=\"alert alert-danger alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Unable to complete action.Please try againg later.</div>";
		}
	}
	xhttp.open("POST", "student.php", true);
	xhttp.send(data);
}

function addFileToData(id, data, isMultiple) {
	var el = document.getElementById(id);
	var token = "";
	if(isMultiple === 1) {
		data.append(id + "Size", el.files.length);
		token = 1;
	}
	for(var i = 0;i < el.files.length;i++) {
		data.append(id + token, el.files[i], username + id + token + "." + el.files[i]['type'].split("/").pop());
		token++;
	}
}

function inputTagEmpty(id, alertMsg, minWordsCount = 1, status = 5) {
	var value = document.getElementById(id).value.trim().replace(/  +/g, ' ');
	if(status === 1)
		return value;
	var name = value.split(/\s+/);
	if(name[0].length === 0 || name.length < minWordsCount) {
		$("#" + id).popover({title : "" , content : alertMsg, placement : "bottom"});
		var el = document.getElementById(id);
		el.classList.add("is-invalid");
		el.focus();
		$("#" + id).popover("show");
		el.onkeyup = function () {
									this.classList.remove("is-invalid");
									$("#" + id).popover("dispose");
									this.onkeyup = function () {return;};
								};
		el.onchange = function () {
									this.classList.remove("is-invalid");
									$("#" + id).popover("dispose");
									this.onchange = function () {return;};
								};
		return false;
	}
	return value;
}

function validateFloatingValues(id, alertMsg, minValue, maxValue = null, status = 5) {
	var value = document.getElementById(id).value.trim();
	if(status === 1)
		return value;
	if((value.split(" ").length != 1 || isNaN(parseFloat(value)) || parseFloat(value) < minValue) || (maxValue != null && parseInt(value) > maxValue)) {
		$("#" + id).popover({title : "" , content : alertMsg, placement : "bottom"});
		var el = document.getElementById(id);
		el.classList.add("is-invalid");
		el.focus();
		$("#" + id).popover("show");
		el.onkeyup = function () {
									this.classList.remove("is-invalid");
									$("#" + id).popover("dispose");
									this.onkeyup = function () {return;};
								};
		return false;	
	}
	return value;
}

function selectTagEmpty(id) {
	var el = document.getElementById(id);
	if(el.value === "-1" || el.value === "") {
		$("#" + id).popover({title : "" , content : "Can not be kept blank", placement : "bottom"});
		$("#" + id).popover("show");
		el.classList.add("is-invalid");
		el.focus();
		el.onchange = function () {
									this.classList.remove("is-invalid");
									$("#" + id).popover("dispose");
									this.onchange = function () {return;};
								};
		return true;
	}
	return false;
}

function viewDetails(sId) {
	for(var i = 0;i < eligibleScholarships.length;i++) {
		if(eligibleScholarships[i]["sId"] == sId)
			break;
	}
	document.getElementById("dsName").innerHTML = eligibleScholarships[i]["sName"];
	document.getElementById("dsRemark").innerHTML = eligibleScholarships[i]["sRemark"];
	document.getElementById("dlda").innerHTML = eligibleScholarships[i]["lastDateOfApplication"];
	document.getElementById("dsType").innerHTML = eligibleScholarships[i]["sType"];
	//document.getElementById("dcgpa").innerHTML = eligibleScholarships[i]["cgpa"];
	document.getElementById("dsamount").innerHTML = eligibleScholarships[i]["amount"];
	document.getElementById("dstudents").innerHTML = eligibleScholarships[i]["noOfStudents"];
	document.getElementById("dApply").onclick = function () { document.getElementById("closeDesc").click();
																displayApplication(document.getElementById("menu2").parentElement, sId);
															};
}
window.addEventListener("load", loadData);
function loadData() {
	isLoggedIn();
	getCodeTables(false);
	getEligibleScholarships(false);
	getProfile(false);
	getApplication(false);
	fillSelectTag("branch", branch, 1);
	fillSelectTag("class", year, 1);
	fillSelectTag("profile-gender", gender, 1);
	fillSelectTag("profile-branch", branch, 1);
	fillSelectTag("profile-class", year, 1);
	document.getElementById("sMIS").innerHTML = username;
	document.getElementById("applicationPrint").onclick = function () {printApplication(scholarshipApplication["row"]["aId"]);};
	var interval = setInterval(function () {getEligibleScholarships(true);}, 60000);
	document.getElementById("menu2").addEventListener("click", function () {displayApplication(this.parentElement);});
	document.getElementById("menu3").addEventListener("click", function () {contactAdmin(this.parentElement);});
	document.getElementById("menu4").addEventListener("click", function () {displayProfile(this.parentElement);});
	document.getElementById("defaultMenu").addEventListener("click", function () {displayEligibleScholarships(this.parentElement);});
	document.getElementById("applicationSubmit").addEventListener("click", function () {submitApplication(2);});
	document.getElementById("applicationSave").addEventListener("click", function () {submitApplication(1);});
	document.getElementById("defaultMenu").click();
	document.getElementById("loader").style.display = "none";
	document.getElementById("hidden-element").style.display = "block";
}
