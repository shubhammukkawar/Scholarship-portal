<?php
require_once('config.php');
require_once('database.php');

$reqType = $_POST['reqType'];
session_start();
if(isset($_SESSION['username']) and isset($_SESSION["role"]) and $_SESSION["role"] == 1)
	echo $reqType();
else
	header("Location: index.html");

function getAssociativeArr($arr, $key1, $key2) {
	$array = array();
	foreach ($arr as $key => $value) {
		$array[$value[$key1]] = $value[$key2];
	}
	return $array;
}

function getCodeTables() {
	$query = "SELECT * FROM year;";
	$rows = sqlGetAllRows($query);
	$result = "{\"year\" : " . json_encode(getAssociativeArr($rows, "yCode", "yName")) . ",";
	$query = "SELECT * FROM branch;";
	$rows = sqlGetAllRows($query);
	$result .= "\"branch\" : " . json_encode(getAssociativeArr($rows, "bCode", "bName")) . ",";
	$query = "SELECT * FROM gender;";
	$rows = sqlGetAllRows($query);
	$result .= "\"gender\" : " . json_encode(getAssociativeArr($rows, "gCode", "gName")) . "}";
	return $result;
}

function getProfile() {
	$username = $_SESSION['username'];
	$query = "SELECT * from userProfile WHERE mis=\"$username\";";
	$rows = sqlGetAllRows($query);
	if(count($rows) != 1)
		return "{\"profile\" : \"empty\"}";
	else
		return json_encode($rows[0]);
}

function saveProfile() {
	$username = $_SESSION['username'];
	$firstName = $_POST['firstName'];
	$lastName = $_POST['lastName'];
	$cgpa = $_POST['cgpa'];
	$gender = $_POST['gender'];
	$year = $_POST['year'];
	$branch = $_POST['branch'];
	$contactNo = $_POST['contactNo'];
	$action = $_POST['action'];
	
	global $CFG;
	if($CFG->conn === false) 
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false)
		die("Database connection error");

	if($action == "update") {
		$stmt = $conn->prepare("UPDATE userProfile SET firstname = ?, lastname = ?, cgpa = ?, branch = ?, year = ?, contactNo = ?, gender = ? WHERE mis = ?");
		$stmt->bind_param("sssiisis", $firstName, $lastName, $cgpa, $branch, $year , $contactNo, $gender, $username);
		$result = $stmt->execute();
		$stmt->close();
	}
	else if($action == "insert") {
		$stmt = $conn->prepare("INSERT INTO userProfile(firstname, lastname, cgpa, branch, year, contactNo, gender, mis) values(?, ?, ?, ?, ?, ?, ?, ?)");
		$stmt->bind_param("sssiisis", $firstName, $lastName, $cgpa, $branch, $year , $contactNo, $gender, $username);
		$result = $stmt->execute();
		$stmt->close();
	}
	if($result === false)
		return "{\"update\" : \"failed\", \"error\" : \"" . $stmt->error ."\"}";
	else
		return "{\"update\" : \"succeed\"}";
}

function getEligibleScholarships() {
	$username = $_SESSION['username'];
	$query = "SELECT * from userProfile WHERE mis=\"$username\";";
	$rows = sqlGetAllRows($query);
	if(count($rows) != 1)
		return "{\"profile\" : \"empty\"}";
	else {
		$cgpa = $rows[0]['cgpa'];
		$gender = $rows[0]['gender'];
		$branch = $rows[0]["branch"];
		$year = $rows[0]["year"];
		$query = "SELECT * FROM scholarship WHERE sId in (SELECT DISTINCT sId FROM scholarshipEligibility where (gCode = 0 OR gCode = $gender) AND (bCode = 0 OR bCode = $branch) AND (yCode = 0 OR yCode = $year)) AND visible = 1 AND lastDateOfApplication > date(curdate())";
		//$query = "select sId from scholarshipEligibility where CAST(fincome as decimal(10,2)) >= CAST(\"$familyIncome\" as decimal(10, 2)) and CAST(cgpa as decimal(4, 2)) <= CAST(\"$cgpa\" as decimal(4, 2)) and visible = 1 and date(lastDateOfApplication) > date(curdate()) and (eligibility = \"2\" or eligibility = \"$gender\");";
		$result = sqlGetAllRows($query);
		return json_encode($result);
	}
}

function insertAdminMessage() {
	$username = $_SESSION['username'];
	$subject = $_POST['subject'];
	$message = $_POST['message'];
	
	global $CFG;
	if($CFG->conn === false) 
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false)
		die("Database connection error");

	$stmt = $conn->prepare("INSERT INTO messages(mis, subject, messageString) values(?, ?, ?)");
	$stmt->bind_param("sss", $username, $subject, $message);
	$result = $stmt->execute();
	$stmt->close();
	if($result === true)
		return "{\"insert\" : \"succeed\"}";
	else
		return "{\"insert\" : \"failed\"}";
}

function saveFile($name, $isMultiple) {
	if($isMultiple === true) {
		$size = $_POST[$name . "Size"];
		$token = 1;
	}
	else {
		$size = 1;
		$token = "";
	}
	if(isset($_FILES[$name . $token])) {
		foreach(glob("uploads/" . $_SESSION["username"] . $name . "*") as $file)
			unlink($file);
		for($i = 1;$i <= $size;$i++) {
			$sourcePath = $_FILES[$name . $token]['tmp_name'];
			$targetPath = "uploads/".$_FILES[$name . $token]['name'];
			move_uploaded_file($sourcePath,$targetPath);
			if($token !== "")
				$token++;
		}
	}
}

function submitApplication() {
	$dir = "uploads";
	if(!file_exists($dir)) {
		$oldmask = umask(0);
		mkdir($dir, 0744);
	}
	$mis = $_SESSION["username"];
	$fullName = $_POST["fullName"];
	$dob = $_POST["dob"] === "" ? null : $_POST["dob"];
	$localAddr = $_POST["localAddr"];
	$permanantAddr = $_POST["permananatAddr"];
	$email = $_POST["email"];
	$contactNo = $_POST["contactNo"];
	$year = (int)$_POST["class"];
	$branch = (int)$_POST["branch"];
	$marksSSC = $_POST["marksSSC"];
	$marksHSC = $_POST["marksHSC"];
	$marksCompet = $_POST["marksCompet"];
	$cpi = $_POST["cpi"];
	$spi = $_POST["spi"];
	$annualIncome = $_POST["annualIncome"];
	$incomeSource = $_POST["incomeSource"];
	$fbrothers = (int)$_POST["fbrothers"];
	$fsisters = (int)$_POST["fsisters"];
	$fmembers = (int)$_POST["fmembers"];
	$sistersEdu = $_POST["sistersEdu"];
	$brothersEdu = $_POST["brothersEdu"];
	$immovableProperty = $_POST["immovableProperty"];
	$otherBenefits = $_POST["otherBenefits"];
	$finReq = $_POST["finReq"];
	$achievements = $_POST["achievements"];
	saveFile("passportPhoto", false);
	saveFile("signature", false);
	saveFile("SSCMarksheet", false);
	saveFile("HSCMarksheet", false);
	saveFile("competMarksheet", false);
	saveFile("admitCard", false);
	saveFile("incomeCert", false);
	saveFile("ecAct", true);
	$sId = json_decode($_POST["sName"]);
	$status = $_POST["status"];
	global $CFG;
	if($CFG->conn === false)
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false)
		die("Database connection error");
	if(isset($_POST["aId"])) {
		$aId = $_POST["aId"];
		$stmt = $conn->prepare("UPDATE applications SET mis = ?, fullName = ?, email = ?, contactNo = ?, localAddr = ?, permanantAddr = ?, DOB = ?, year = ?, branch = ?, markSSC = ?, markHSC = ?, markCompet = ?, familyBrothers = ?, familySisters = ?, familyMembers = ?, annualIncome = ?, incomeSource = ?, brothersEducation = ?, sistersEducation = ?, immovableProperty = ?, otherBenefits = ?, finReq = ?, achievements = ?, cpi = ?, spi = ?, status = ? WHERE aId = ?");
		$stmt->bind_param("sssssssiisssiiissssssssssii", $mis, $fullName, $email, $contactNo, $localAddr, $permanantAddr, $dob, $year, $branch, $marksSSC, $marksHSC, $marksCompet, $fbrothers, $fsisters, $fmembers, $annualIncome, $incomeSource, $brothersEdu, $sistersEdu, $immovableProperty, $otherBenefits, $finReq, $achievements, $cpi, $spi, $status, $aId);
		$res = $stmt->execute();
		$stmt->close();
		$stmt = $conn->prepare("DELETE FROM applicationForScholarship WHERE aId = ?");
		$stmt->bind_param("i", $aId);
		$stmt->execute();
		$stmt->close();
	}
	else {
		$stmt = $conn->prepare("INSERT INTO applications(mis, fullName, email, contactNo, localAddr, permanantAddr, DOB, year, branch, markSSC, markHSC, markCompet, familyBrothers, familySisters, familyMembers, annualIncome, incomeSource, brothersEducation, sistersEducation, immovableProperty, otherBenefits, finReq, achievements, cpi, spi, status) values  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
		$stmt->bind_param("sssssssiisssiiissssssssssi", $mis, $fullName, $email, $contactNo, $localAddr, $permanantAddr, $dob, $year, $branch, $marksSSC, $marksHSC, $marksCompet, $fbrothers, $fsisters, $fmembers, $annualIncome, $incomeSource, $brothersEdu, $sistersEdu, $immovableProperty, $otherBenefits, $finReq, $achievements, $cpi, $spi, $status);
		$res = $stmt->execute();
		$aId = $conn->insert_id;
		$stmt->close();
	}
	$stmt = $conn->prepare("INSERT INTO applicationForScholarship (aId, sId) values (?, ?)");
	for($i = 0;$i < count($sId);$i++) {
		$stmt->bind_param("ii", $aId, $sId[$i]);
		$stmt->execute();
	}
	$stmt->close();
	if($res === true)
		return "{\"application\" : \"submitted\"}";
	else
		return "{\"application\" : \"notSubmitted\"}";
}

function getFileName($name, $isMultiple) {
	$files = glob("uploads/" . $_SESSION["username"] . $name . "*");
	return $files;
}

function checkApplicationStatus() {
	$username = $_SESSION['username'];
	$query = "SELECT * FROM applications where mis=\"$username\";";
	$result = sqlGetOneRow($query);
	if($result === false)
		return "{\"application\" : \"notExists\"}";
	else {
		$query = "SELECT * FROM applicationForScholarship WHERE aId = ". $result[0]["aId"] .";";
		$scholarship = sqlGetAllRows($query);
		$result[0]["sName"] = $scholarship;
		$result[0]["passportPhoto"] = getFileName("passportPhoto", false);
		$result[0]["signature"] = getFileName("signature", false);
		$result[0]["SSCMarksheet"] = getFileName("SSCMarksheet", false);
		$result[0]["HSCMarksheet"] = getFileName("HSCMarksheet", false);
		$result[0]["competMarksheet"] = getFileName("competMarksheet", false);
		$result[0]["admitCard"] = getFileName("admitCard", false);
		$result[0]["incomeCert"] = getFileName("incomeCert", false);
		$result[0]["ecAct"] = getFileName("ecAct", true);
		return "{\"application\" : \"exists\", \"row\" : ". json_encode($result[0]) . "}";
	}
}

function getScholarshipNames() {
	global $CFG;
	if($CFG->conn === false) 
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false)
		die("Database connection error");

	$aId = (int) $_POST["aId"];
	$result = sqlGetAllRows("SELECT * FROM scholarship WHERE sId in (SELECT sId FROM applicationForScholarship WHERE aId = $aId);");
	if($result !== false)
		return json_encode($result);
	else
		return "{\"request\" : \"failed\"}";
}
?>
