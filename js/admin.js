"use strict";
var currElement = null;
var response = null;
var currMenu = null;
var scholarships = null;
var applications = null;
var notifications = null;
var scholarshipDT = null;
var applicationsDT = null;
var notificationsDT = null;
var branch = null;
var year = null;
var gender = null;

function getApplications(async) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			applications = JSON.parse(this.responseText);
		}
	}
	xhttp.open("POST", "admin.php", async);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=getApplications");
}

function displayApplications() {
	if(currElement != null)
		currElement.style.display = "none";
	if(currMenu != null)
		currMenu.classList.remove("active");
	arguments[0].classList.add("active");
	currMenu = arguments[0];
	currElement = document.getElementById("applicationsDiv");
	currElement.style.display = "block";
	$(".popover").popover('dispose');
	if(applicationsDT !== null)
		applicationsDT.destroy(false);

	var table = document.getElementById("applicationsTable");
	table.innerHTML = "";
	/*create header Row*/
	var thead = document.createElement("thead")
	table.appendChild(thead);
	var tr = document.createElement("tr");
	thead.appendChild(tr);
	
	var headerRow = ["MIS", "Full Name", "10th Marks", "12th Marks", "CET/Diploma Marks", "cgpa", "Family Income", "Action"];
	var cellWidth = [80, 350, 80, 80, 80, 80, 150, 20]
	for(var j = 0; j < headerRow.length; j++) {
		var th = document.createElement("th");
		th.style.width = cellWidth[j] + 'px';
		tr.appendChild(th);
		var tc = document.createTextNode(headerRow[j]);
		th.appendChild(tc);
	}
	
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	for(var i = 0;i < applications.length;i++) {
		tr = document.createElement("tr");
		tbody.appendChild(tr);
		createTextNode(tr, cellWidth[0], applications[i]['mis']);
		createTextNode(tr, cellWidth[1], applications[i]['fullName']);
		createTextNode(tr, cellWidth[2], applications[i]['markSSC']);
		createTextNode(tr, cellWidth[3], applications[i]['markHSC']);
		createTextNode(tr, cellWidth[4], applications[i]['markCompet']);
		createTextNode(tr, cellWidth[5], applications[i]['cpi']);
		createTextNode(tr, cellWidth[6], applications[i]['annualIncome']);
		/*td = document.createElement("td");
		td.setAttribute("class", "sCell");
		td.style.width = cellWidth[7] + 'px';
		tr.appendChild(td);
		center = document.createElement("center");
		a = document.createElement("a");
		a.href = response[i]['casteCert'];
		td.appendChild(center);
		center.appendChild(a);
		a.appendChild(document.createTextNode("download"));*/
		
		/*var td = document.createElement("td");
		td.style.width = cellWidth[8] + 'px';
		tr.appendChild(td);
		var center = document.createElement("center");
		var a = document.createElement("a");
		a.href = applications[i]['incomeCert'];
		td.appendChild(center);
		center.appendChild(a);
		a.appendChild(document.createTextNode("download"));*/
		
		var td = document.createElement("td");
		td.innerHTML = "<button type=\"button\" id=\"" + applications[i]["aId"] + "\" data-toggle=\"modal\" data-target=\"#applicationsModal\" onclick=\"viewApplication("+ applications[i]["aId"] +")\">View</button>";
		tr.appendChild(td);
	}
	applicationsDT = $('#applicationsTable').DataTable();
}

function getScholarship(async) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			scholarships = JSON.parse(this.responseText);
		}
	}
	xhttp.open("POST", "admin.php", async);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=getScholarship");
}

function displayScholarships() {
	currMenu.classList.remove("active");
	arguments[0].classList.add("active");
	currMenu = arguments[0];
	if(currElement != null)
		currElement.style.display = "none";
	currElement = document.getElementById("scholarshipDiv");
	currElement.style.display = "block";
	$(".popover").popover("dispose");
	removeClass(currElement, "is-invalid");
	
	if(scholarshipDT !== null)
		scholarshipDT.destroy(false);
	var table = document.getElementById("scholarshipTable");
	table.innerHTML = "";
	var thead = document.createElement("thead");
	table.appendChild(thead);
	
	/*create header Row*/
	var tr = document.createElement("tr");
	thead.appendChild(tr);
	var headerRow = ["Scholarship Name", "Scholarship Type", "Amount", "published", "Actions"];
	var cellWidth = [170, 150, 70, 90, 20]
	for(var j = 0; j < headerRow.length; j++) {
		var th = document.createElement("th");
		th.style.width = cellWidth[j] + 'px';
		tr.appendChild(th);
		var tc = document.createTextNode(headerRow[j]);
		th.appendChild(tc);
	}
	
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	var options = ["No", "Yes"];

	/*display existing scholarships in database*/
	var count = 1;
	for(var i in scholarships) {
		var row = document.createElement("tr");
		tbody.appendChild(row);
		//insertTextColumn(row, response[i]["sId"], count);
		insertTextColumn(row, "", scholarships[i]["sName"]);
		insertTextColumn(row, "", scholarships[i]["sType"]);
		insertTextColumn(row, "", scholarships[i]["amount"]);
		insertTextColumn(row, "", options[scholarships[i]["visible"]]);
		insertButton(row, scholarships[i]["sId"] + "_editButton", "scholarshipEdit(" + scholarships[i]["sId"] + ")", "Edit");
		count++;
	}
	scholarshipDT = $('#scholarshipTable').DataTable();
}

function insertRow(table, count, className) {
	var row = table.insertRow(count);
	return row;
}

function insertCell(row, className) {
	var cell = row.insertCell(-1);
	return cell;
}

function insertButton(row, id, onClickFunction, text){
	var cell = insertCell(row, "sCell");
	cell.innerHTML = "<Button type=\"button\" data-toggle=\"modal\" data-target=\"#myModal\" id=\"" + id +"\" onclick=\""+ onClickFunction +"\">Edit</Button>";
	return cell;
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

function insertTextColumn(row, id, text) {
	var cell = insertCell(row, "sCell");
	//var centerTag = document.createElement("center");
	cell.setAttribute("id", id);
	//centerTag.setAttribute("value", text);
	var centerText = document.createTextNode(text);
	//centerTag.appendChild(centerText);
	cell.appendChild(centerText);
	return cell;
}

function validateTextField(minWordsCount, id, alertMsg) {
	var value = document.getElementById(id).value.trim();
	var name = value.replace(/  +/g, ' ').split(/\s+/);
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

function validateFloatingValues(id, alertMsg, minValue, maxValue = null) {
	var value = document.getElementById(id).value.trim();
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
	if(document.getElementById(id).value === "-1") {
		$("#" + id).popover({title : "" , content : "Can not be kept blank", placement : "bottom"});
		$("#" + id).popover("show");
		var el = document.getElementById(id);
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

function scholarshipInsert() {
	var sName = validateTextField(1, "sNameAdd", "Enter Scholarship Name");
	if(!sName)
		return;
	var sType = validateTextField(1, "sTypeAdd", "Enter Scholarship Type");
	if(!sType)
		return;
	var amount = validateFloatingValues("sAmountAdd", "Enter valid amount", 0);
	if(!amount)
		return;
	var students = validateFloatingValues("sStudentsAdd", "Enter valid number", 0);
	if(!students)
		return;
	var sRemark = validateTextField(1, "sRemarkAdd", "Enter Scholarship Remark");
	if(!sRemark)
		return;
	var branches = $("#sEligibleBranchAdd").val();
	if(branches.length === 0)
		return;
	if(selectTagEmpty("sEligibleGenderAdd"))
		return;
	var eligibility = document.getElementById("sEligibleGenderAdd").value;
	var sLDA = validateTextField(1, "sldaAdd", "Enter Valid Date");
	if(!sLDA)
		return;
	/*var familyIncome = validateFloatingValues("familyIncomeAdd", "Enter valid Family Income Amount", 0);
	if(!familyIncome)
		return;
	var cgpa = validateFloatingValues("cgpaAdd", "Enter valid CGPA", 0, 10);
	if(!cgpa)
		return;*/
	var published = document.getElementById("sPublishedAdd").value;
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			response = JSON.parse(this.responseText);
			if(response["add"] == "failed") {
				alert("Unable to add scholarship. \nError From Server");
			} 
			else {
				var currRow = response["row"];
				scholarships.push(currRow);
				var row = createRowNode(currRow);
				scholarshipDT = scholarshipDT.row.add(row).draw();

				document.getElementById("sNameAdd").value = "";
				document.getElementById("sTypeAdd").value = "";
				document.getElementById("sRemarkAdd").value = "";
				document.getElementById("sldaAdd").value = "";
				document.getElementById("sAmountAdd").value = "";
				document.getElementById("sStudentsAdd").value = "";
				document.getElementById("sPublishedAdd").value = "0";
				document.getElementById("sEligibleGenderAdd").value = "-1";
				$("#sEligibleBranchAdd").selectpicker("val", []);
			}
		}
	}
	xhttp.open("POST", "admin.php", true);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=scholarshipInsert&sName=" + sName + "&sType=" + sType + "&sRemark=" + sRemark + "&sLDA=" + sLDA + "&amount=" + amount + "&students=" + students + "&branches=" + JSON.stringify(branches) + "&eligibility=" + eligibility + "&published=" + published);
}

function scholarshipUpdate(sId) {
	var sName = validateTextField(1, "sNameAdd", "Enter Scholarship Name");
	if(!sName)
		return;
	var sType = validateTextField(1, "sTypeAdd", "Enter Scholarship Type");
	if(!sType)
		return;
	var amount = validateFloatingValues("sAmountAdd", "Enter valid amount", 0);
	if(!amount)
		return;
	var students = validateFloatingValues("sStudentsAdd", "Enter valid number", 0);
	if(!students)
		return;
	var sRemark = validateTextField(1, "sRemarkAdd", "Enter Scholarship Remark");
	if(!sRemark)
		return;
	var branches = $("#sEligibleBranchAdd").val();
	if(branches.length === 0)
		return;
	if(selectTagEmpty("sEligibleGenderAdd"))
		return;
	var eligibility = document.getElementById("sEligibleGenderAdd").value;
	var sLDA = validateTextField(1, "sldaAdd", "Enter Valid Date");
	if(!sLDA)
		return;
	var published = document.getElementById("sPublishedAdd").value;

	document.getElementById("modalButton").nodeValue = "Updating";
	document.getElementById("modalButton").disabled = true;
	document.getElementById("modalButtonDelete").disabled = true;
	document.getElementById("closebtn1").disabled = true;
	document.getElementById("closebtn2").disabled = true;

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			response = JSON.parse(this.responseText);
			if(response["update"] == "failed") {
				alert("Update scholarship : Failed. \nError From Server");
			}
			else {
				var row = document.getElementById(sId + "_editButton").parentElement.parentElement;
				scholarshipDT.row(row).remove();
				for(var i = 0; i < scholarships.length; i++) {
					if(scholarships[i]["sId"] == sId) {
						scholarships.splice(i, 1);
						break;
					}
				}
				scholarships.push(response["row"]);
				scholarshipDT = scholarshipDT.row.add(createRowNode(response["row"])).draw();
			}
			document.getElementById("modalButton").nodeValue = "Update";
			document.getElementById("modalButtonDelete").disabled = false;
			document.getElementById("modalButton").disabled = false;
			document.getElementById("closebtn1").disabled = false;
			document.getElementById("closebtn2").disabled = false;
		}
	}
	xhttp.open("POST", "admin.php", true);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=scholarshipUpdate&sId=" + sId + "&sName=" + sName + "&sType=" + sType + "&sRemark=" + sRemark + "&sLDA=" + sLDA + "&amount=" + amount + "&students=" + students + "&branches=" + JSON.stringify(branches) + "&eligibility=" + eligibility + "&published=" + published);
}

function createRowNode(rowObj) {
	var options = ["No", "Yes"];
	var row = document.createElement("tr");
	//insertTextColumn(row, response["row"]["sId"], scholarships.length);
	insertTextColumn(row, "", rowObj["sName"]);
	insertTextColumn(row, "", rowObj["sType"]);
	insertTextColumn(row, "", rowObj["amount"]);
	insertTextColumn(row, "", options[rowObj["visible"]]);
	insertButton(row, rowObj["sId"] + "_editButton", "scholarshipEdit(" + rowObj["sId"] + ")", "Edit");
	return row;
}

function scholarshipDelete(sId) {
	var action = confirm("Do you want to delete the scholarship Data?");
	if(action != true)
		return;
	document.getElementById("modalButtonDelete").nodeValue = "Deleting";
	document.getElementById("modalButtonDelete").disabled = true;
	document.getElementById("modalButton").disabled = true;
	document.getElementById("closebtn1").disabled = true;
	document.getElementById("closebtn2").disabled = true;

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			response = JSON.parse(this.responseText);
			if(response["delete"] == "failed") {
				document.getElementById("modalButtonDelete").nodeValue = "Delete";
				alert("Delete scholarship : Failed. \nError From Server");
			}
			else {
				var row = document.getElementById(sId + "_editButton").parentElement.parentElement;
				scholarshipDT = scholarshipDT.row(row).remove().draw(false);
				for(var i = 0; i < scholarships.length; i++) {
					if(scholarships[i]["sId"] == sId) {
						scholarships.splice(i, 1);
						break;
					}
				}
				document.getElementById("closebtn1").disabled = false;
				document.getElementById("closebtn1").click();
			}
			document.getElementById("modalButtonDelete").disabled = false;
			document.getElementById("modalButton").disabled = false;
			document.getElementById("closebtn1").disabled = false;
			document.getElementById("closebtn2").disabled = false;
		}
	}
	xhttp.open("POST", "admin.php", true);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=scholarshipDelete&sId=" + sId);
}

function getMessages(async) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			notifications = JSON.parse(this.responseText);
		}
	}
	xhttp.open("POST", "admin.php", async);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=getMessages");
}

function displayMessages() {
	currMenu.classList.remove("active");
	arguments[0].classList.add("active");
	currMenu = arguments[0];

	if(currElement != null)
		currElement.style.display = "none";
	currElement = document.getElementById("notificationsDiv");
	currElement.style.display = "block";
	$(".popover").popover('dispose');
	if(notificationsDT !== null)
		notificationsDT.destroy(false);
	
	var table = document.getElementById("notificationsTable");
	table.innerHTML = "";
	var thead = document.createElement("thead");
	table.appendChild(thead);
	
	/*create header Row*/
	var tr = document.createElement("tr");
	thead.appendChild(tr);
	
	var headerRow = ["Time", "MIS", "Subject", "Message"];
	var cellWidth = [70, 90, 200, 600]
	for(var j = 0; j < headerRow.length; j++) {
		var th = document.createElement("th");
		th.style.width = cellWidth[j] + 'px';
		tr.appendChild(th);
		var tc = document.createTextNode(headerRow[j]);
		th.appendChild(tc);
	}

	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	for(var i = 0;i < notifications.length;i++) {
		tr = document.createElement("tr");
		tbody.appendChild(tr);
		insertTextColumn(tr, "not_" + notifications[i]["mId"], notifications[i]['time']);
		createTextNode(tr, cellWidth[1], notifications[i]['mis']);
		createTextNode(tr, cellWidth[2], notifications[i]['subject']);
		createTextNode(tr, cellWidth[3], notifications[i]['messageString']);
	}
	notificationsDT = $('#notificationsTable').DataTable({"aaSorting": []});
	$('#notificationsTable tbody').on( 'click', 'tr', function () {
        $(this).toggleClass('selected');
        $("#deleteSelected").prop("disabled", notificationsDT.rows('.selected').data().length === 0 ? true : false);
    } );
    $('#deleteSelected').click( function () {
        if(notificationsDT.rows('.selected').data().length === 0)
        	return;
        deleteNotifications();
    } );
}

function deleteNotifications() {
	var nots = document.getElementById("notificationsTable").getElementsByClassName("selected");
	var nId = [];
	for(var i = 0;i < nots.length;i++)
		nId.push(nots[i].childNodes[0].id.split("_")[1]);
	var nIdStr = JSON.stringify(nId);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			response = JSON.parse(this.responseText);
			//var rows = document.getElementById("notificationsTable").getElementsByClassName("selected");
			if(response["delete"] === "succeed") {
				for(var j = 0;j < notifications.length;j++) {
					var index = nId.indexOf(notifications[j]["mId"]);
					if(index === -1)
						continue;
					notifications.splice(j, 1);
					j--;
					nId.splice(index, 1);
				}
				for(var i = 0;i < nots.length;i++)
					notificationsDT.row(nots[i]).remove();
				notificationsDT = notificationsDT.draw( false );
				document.getElementById("deleteSelected").disabled = true;
			}
			else {
				for(var i = 0;i < rows.length;i++)
					nots[i].classList.remove("selected");
			}
		}
	}
	xhttp.open("POST", "admin.php", true); // asynchronous
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=deleteMessages&mIds="+ nIdStr);
}

document.getElementById("defaultMenu").addEventListener("click", function () {displayApplications(this.parentElement);});
document.getElementById("menu2").addEventListener("click", function () {displayScholarships(this.parentElement);});
document.getElementById("menu3").addEventListener("click", function () {displayMessages(this.parentElement);});

function newScholarship() {
	var el = document.getElementById("myModal");
	Array.prototype.map.call(el.getElementsByTagName("input"), function () {arguments[0].classList.remove("is-invalid");});
	Array.prototype.map.call(el.getElementsByTagName("textarea"), function () {arguments[0].classList.remove("is-invalid");});
	Array.prototype.map.call(el.getElementsByTagName("select"), function () {arguments[0].classList.remove("is-invalid");});
	$("#myModal input").popover('dispose');
	$("#myModal textarea").popover('dispose');
	$("#myModal select").popover('dispose');
	document.getElementById("modalTitle").innerHTML = "Add new Scholarship";
	var btn = document.getElementById("modalButton");
	btn.innerHTML = "Add";
	btn.onclick = function () {scholarshipInsert();};
	document.getElementById("modalButtonDelete").style.display = "none";
	document.getElementById("sNameAdd").value = "";
	document.getElementById("sRemarkAdd").value = "";
	document.getElementById("sldaAdd").value = "";
	document.getElementById("sTypeAdd").value = "";
	document.getElementById("sAmountAdd").value = "";
	document.getElementById("sStudentsAdd").value = "";
	document.getElementById("sPublishedAdd").value = "0";
	$("#sEligibleBranchAdd").selectpicker("val", []);
	document.getElementById("sEligibleGenderAdd").value = "-1";
}

function scholarshipEdit(sId) {
	var el = document.getElementById("myModal");
	Array.prototype.map.call(el.getElementsByTagName("input"), function () {arguments[0].classList.remove("is-invalid");});
	Array.prototype.map.call(el.getElementsByTagName("textarea"), function () {arguments[0].classList.remove("is-invalid");});
	Array.prototype.map.call(el.getElementsByTagName("select"), function () {arguments[0].classList.remove("is-invalid");});
	$("#myModal input").popover('dispose');
	$("#myModal textarea").popover('dispose');
	$("#myModal select").popover('dispose');
	document.getElementById("modalTitle").innerHTML = "Edit Scholarship";
	var btn1 = document.getElementById("modalButton");
	btn1.innerHTML = "Update";
	btn1.onclick = function () {scholarshipUpdate(sId);};
	var btn2 = document.getElementById("modalButtonDelete");
	btn2.style.display = "block";
	btn2.onclick = function () {scholarshipDelete(sId);};
	
	for(var i = 0; i < scholarships.length; i++) {
		if(scholarships[i]["sId"] == sId) {
			document.getElementById("sNameAdd").value = scholarships[i]["sName"];
			document.getElementById("sTypeAdd").value = scholarships[i]["sType"];
			document.getElementById("sRemarkAdd").value = scholarships[i]["sRemark"];
			document.getElementById("sldaAdd").value = scholarships[i]["lastDateOfApplication"];
			document.getElementById("sAmountAdd").value = scholarships[i]["amount"];
			document.getElementById("sStudentsAdd").value = scholarships[i]["noOfStudents"];
			document.getElementById("sPublishedAdd").value = scholarships[i]["visible"];
			document.getElementById("sEligibleGenderAdd").value = scholarships[i]["eligibility"];
			$("#sEligibleBranchAdd").selectpicker("val", scholarships[i]["branches"]);
			break;
		}
	}
}

function viewApplication(aId) {
	for(var i = 0;i < applications.length;i++) {
		if(aId == applications[i]["aId"])
			break;
	}
	var k = 0;
	if(scholarships != null)
		for(var j = 0;j < scholarships.length;j++) {
			if(k < applications[i]["sId"].length && applications[i]["sId"][k]["sId"] == scholarships[j]["sId"]) {
				document.getElementById("asName").innerHTML = document.getElementById("asName").innerHTML + scholarships[j]["sName"];
				k++;
				continue;
			}
		}
	document.getElementById("aaId").innerHTML = applications[i]["aId"];
	document.getElementById("afullName").innerHTML = applications[i]['fullName'];
	document.getElementById("adob").innerHTML = applications[i]['DOB'];
	document.getElementById("acAdd").innerHTML = applications[i]['localAddr'];
	document.getElementById("apAdd").innerHTML = applications[i]['permanantAddr'];
	document.getElementById("aclass").innerHTML = year[applications[i]["year"]];
	document.getElementById("abranch").innerHTML = branch[applications[i]["branch"]];
	document.getElementById("aemail").innerHTML = applications[i]['email'];
	document.getElementById("acontactNo").innerHTML = applications[i]['contactNo'];
	document.getElementById("amarksSSC").innerHTML = applications[i]['markSSC'];
	document.getElementById("amarksHSC").innerHTML = applications[i]['markHSC'];
	document.getElementById("amarksCompet").innerHTML = applications[i]['markCompet'];
	document.getElementById("acpi").innerHTML = applications[i]['cpi'];
	document.getElementById("aspi").innerHTML = applications[i]['spi'];
	document.getElementById("aannualIncome").innerHTML = applications[i]['annualIncome'];
	document.getElementById("aincomeSource").innerHTML = applications[i]['incomeSource'];
	document.getElementById("afamilyBrothers").innerHTML = applications[i]['familyBrothers'];
	document.getElementById("afamilySisters").innerHTML = applications[i]['familySisters'];
	document.getElementById("afamilyMembers").innerHTML = applications[i]['familyMembers'];
	document.getElementById("abrothersEducation").innerHTML = applications[i]['brothersEducation'];
	document.getElementById("asistersEducation").innerHTML = applications[i]['sistersEducation'];
	document.getElementById("aimmovableProperty").innerHTML = applications[i]['immovableProperty'];
	document.getElementById("aotherBenefits").innerHTML = applications[i]['otherBenefits'];
	document.getElementById("afinReq").innerHTML = applications[i]['finReq'];
	document.getElementById("aachievements").innerHTML = applications[i]['achievements'];
	document.getElementById("apassportPhoto").href = applications[i]['passportPhoto'][0];
	document.getElementById("asignature").href = applications[i]['signature'][0];
	document.getElementById("aSSCMarksheet").href = applications[i]['SSCMarksheet'][0];
	document.getElementById("aHSCMarksheet").href = applications[i]['HSCMarksheet'][0];
	document.getElementById("aCompetMarksheet").href = applications[i]['competMarksheet'][0];
	document.getElementById("aadmitCard").href = applications[i]['admitCard'][0];
	document.getElementById("aincomeCert").href = applications[i]['incomeCert'][0];
	var container = document.getElementById("ecActDiv");
	container.innerHTML = "";
	for(var j = 0;j < applications[i]["ecAct"].length;j++) {
		var anc = document.createElement("a");
		anc.href = applications[i]["ecAct"][j];
		anc.target = "_blank";
		anc.innerHTML = "<i class=\"fa fa-paperclip\"></i>Download";
		container.appendChild(anc);
	}
	document.getElementById("printButton").onclick = function () {printApplication(aId);};
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
	xhttp.open("POST", "admin.php", async);
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("reqType=getCodeTables");
}

function fillMultipleSelectTag(id) {
	var el = document.getElementById(id);
	el.classList.add("form-control");
	for(var i = 1;i < year.length;i++) {
		var optgroup = document.createElement("optgroup");
		optgroup.setAttribute("data-subtext", "text");
		optgroup.label = "All " + year[i];
		optgroup.classList.add("closed");
		for(var j = 1;j < branch.length;j++) {
			var opt = document.createElement("option");
			opt.value = i + "_" + j;
			opt.innerHTML = year[i] + " " + branch[j];
			optgroup.appendChild(opt);
		}
		el.appendChild(optgroup);
	}
}

function createOptionTag(value, text) {
	var option = document.createElement("option");
	option.value = value;
	option.innerHTML = text;
	return option;
}

function fillSelectTag(id, table, start, reset = 0) {
	var el = document.getElementById(id);
	if(reset === 1)
		el.innerHTML = "";
	el.appendChild(createOptionTag("-1", ""));
	for(var i = start;i < table.length;i++)
		el.appendChild(createOptionTag("" + i, table[i]));
	el.value = "-1";
}

function removeClass(el, cls) {
	var els = el.getElementsByClassName(cls);
	for(var x = 0;x < els.length;x++)
		els[x].classList.remove("is-invalid");
}

window.onload = loadData;
function loadData() {
	isLoggedIn();
	getCodeTables(false);
	getApplications(false);
	getScholarship(false);
	getMessages(false);
	fillSelectTag("sEligibleGenderAdd", gender, 0);
	fillMultipleSelectTag("sEligibleBranchAdd");
	$('#sEligibleBranchAdd').selectpicker();
	// when clicking on an optgroup "label", toggle it's "children"
	$(document).on("mouseup", ".text-muted", function (){
		var el = this.parentElement.parentElement;
		var classList = el.classList;
		for(var i = 0;i < classList.length;i++) {
			if(classList[i].indexOf("optgroup-") != -1) {
				var className = classList[i];
				break;
			}
		}
		var els = el.parentElement.getElementsByClassName(className);
		Array.prototype.map.call(els, function (el) {el.style.display = el.style.display === "none" ? "" : "none";});
		el.style.display = el.style.display === "none" ? "" : "none";
	});
	// initially close all optgroups that have the class "closed"
	var flag = 1;
	$(document).on("shown.bs.select", function (){
		if(flag) {
			Array.prototype.map.call(document.getElementsByClassName("dropdown-header closed"), function (el) {
				var classList = el.classList;
				for(var i = 0;i < classList.length;i++) {
					if(classList[i].indexOf("optgroup-") != -1) {
						var className = classList[i];
						break;
					}
				}
				var els = el.parentElement.getElementsByClassName(className);
				Array.prototype.map.call(els, function (el) {el.style.display = el.style.display === "none" ? "" : "none";});
				el.style.display = el.style.display === "none" ? "" : "none";
			});
			Array.prototype.map.call(document.getElementsByClassName("text-muted"),function (el) {el.innerHTML = "<i style='font-size:20px;' class='fa'>&#xf0dd;</i>";});
		}
		flag = 0;
	});
	/*$(document).on("click", ".dropdown-header", function () {
		var val = $('.selectpicker').val();
		var classList = this.classList;
		for(var i = 0;i < classList.length;i++) {
			if(classList[i].indexOf("optgroup-") != -1) {
				var className = classList[i];
				break;
			}
		}
		//get values of each option in optgroup
		//add those values to val array
		//set select element value
		//add .selected class to each option to show select tick
	})*/
	/*$("#sEligibleBranchAdd").multiselect({
		enableClickableOptGroups: true,
		collapseOptGroupsByDefault: true,
		enableCollapsibleOptGroups: true,
		includeResetOption: true,
		resetText: "Reset all"
	});*/
	var interval = setInterval(function () {getApplications(true);getMessages(true);}, 60000);
	document.getElementById("defaultMenu").click();
	document.getElementById("loader").style.display = "none";
	document.getElementById("hidden-element").style.display = "block";
}
