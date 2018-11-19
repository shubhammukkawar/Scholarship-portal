<?php
require_once('config.php');
require_once('database.php');

$reqType = $_POST['reqType'];
session_start();
if(isset($_SESSION['username']) and isset($_SESSION["role"]) and $_SESSION["role"] == 0)
	echo $reqType();
else
	header("Location: index.html");

function getScholarship() {
	header("Content-Type: application/JSON; charset=UTF-8");
	$query = "select * from scholarship order by sId;";
	$scholarshipRows = sqlGetAllRows($query);
	
	$query = "select * from scholarshipEligibility order by sId;";
	$rows = sqlGetAllRows($query);
	$j = 0;
	for($i = 0;$i < count($scholarshipRows);$i++) {
		$sId = $scholarshipRows[$i]["sId"];
		$branches = array();
		while($j < count($rows) and $rows[$j]["sId"] === $sId) {
			array_push($branches, $rows[$j]["yCode"] . "_" . $rows[$j]["bCode"]);
			$scholarshipRows[$i]["eligibility"] = $rows[$j]["gCode"];
			$j++;
		}
		$scholarshipRows[$i]["branches"] = $branches;
	}
	return json_encode($scholarshipRows);
}

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

function scholarshipInsert() {
	$sName = $_POST["sName"];
	$sType = $_POST["sType"];
	$sRemark = $_POST["sRemark"];
	$sLDA = $_POST["sLDA"];
	$amount = $_POST["amount"];
	$students = (int)$_POST["students"];
	$published = (int)$_POST["published"];
	$eligibility = (int)$_POST["eligibility"];
	$branches = json_decode($_POST["branches"]);
	global $CFG;
	if($CFG->conn === false)
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false) {
		die("db.php: Database connection error");
	}
	
	$stmt = $conn->prepare("INSERT INTO scholarship(sName, sType, sRemark, lastDateOfApplication, visible, amount, noOfStudents) values (?, ?, ?, ?, ?, ?, ?)");
	$stmt->bind_param("ssssisi", $sName, $sType, $sRemark, $sLDA, $published, $amount, $students);
	$result = $stmt->execute();
	$sId = $conn->insert_id;
	if($result === false)
		return "{\"add\" : \"failed\"}";
	$stmt->close();
	
	$query = "SELECT * FROM scholarship where sId = $sId;";
	$result = $conn->query($query);
	$row = $result->fetch_all(MYSQLI_ASSOC);
	$row[0]["branches"] = $branches;
	$row[0]["eligibility"] = $eligibility;

	$stmt = $conn->prepare("INSERT INTO scholarshipEligibility(sId, bCode, yCode, gCode) VALUES (?, ?, ?, ?);");
	for($i = 0;$i < count($branches);$i++) {
		$val = explode("_", $branches[$i]);
		$bCode = $val[1];
		$yCode = $val[0];
		$stmt->bind_param("iiii", $sId, $bCode, $yCode, $eligibility);
		$result = $stmt->execute();
	}
	$stmt->close();
	return "{\"add\" : \"succeed\", \"row\" :" .  json_encode($row[0]) ."}";
}

function scholarshipUpdate() {
	$sId = (int)$_POST["sId"];
	$sName = $_POST["sName"];
	$sType = $_POST["sType"];
	$sRemark = $_POST["sRemark"];
	$sLDA = $_POST["sLDA"];
	$amount = $_POST["amount"];
	$students = (int)$_POST["students"];
	$published = (int)$_POST["published"];
	$eligibility = (int)$_POST["eligibility"];
	$branches = json_decode($_POST["branches"]);
	
	global $CFG;
	if($CFG->conn === false)
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false) {
		die("db.php: Database connection error");
	}
	
	$stmt = $conn->prepare("UPDATE scholarship SET sName = ?, sType = ?, sRemark = ?, lastDateOfApplication = ?, visible = ?, amount = ?, noOfStudents = ? WHERE sId = ?");
	$stmt->bind_param("ssssisii", $sName, $sType, $sRemark, $sLDA, $published, $amount, $students, $sId);
	$result = $stmt->execute();

	if($result === false)
		return "{\"update\" : \"failed\"}";
	$stmt->close();
	
	$query = "SELECT * FROM scholarship where sId = $sId;";
	$result = $conn->query($query);
	$row = $result->fetch_all(MYSQLI_ASSOC);
	$row[0]["branches"] = $branches;
	$row[0]["eligibility"] = $eligibility;

	$stmt = $conn->prepare("DELETE FROM scholarshipEligibility WHERE sId = ?");
	$stmt->bind_param("i", $sId);
	$result = $stmt->execute();
	$stmt->close();
	$stmt = $conn->prepare("INSERT INTO scholarshipEligibility(sId, bCode, yCode, gCode) VALUES (?, ?, ?, ?);");
	for($i = 0;$i < count($branches);$i++) {
		$val = explode("_", $branches[$i]);
		$bCode = $val[1];
		$yCode = $val[0];
		$stmt->bind_param("iiii", $sId, $bCode, $yCode, $eligibility);
		$result = $stmt->execute();
	}
	$stmt->close();
	return "{\"update\" : \"succeed\", \"row\" :" .  json_encode($row[0]) ."}";
}

function scholarshipDelete() {
	$sId = (int)$_POST["sId"];

	global $CFG;
	if($CFG->conn === false)
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false) {
		die("db.php: Database connection error");
	}
	
	$stmt = $conn->prepare("DELETE FROM scholarship WHERE sId = ?");
	$stmt->bind_param("i", $sId);
	$result = $stmt->execute();

	if($result === false)
		return "{\"delete\" : \"failed\"}";
	$stmt->close();
	return "{\"delete\" : \"succeed\"}";
}

function getMessages() {
	$query = "SELECT mId, mis, subject, messageString, date_format(time, '%m/%d/%Y %l:%i %p') time FROM messages ORDER BY mId DESC;";
	$result = sqlGetAllRows($query);
	return json_encode($result);
}

function deleteMessages() {
	$mIds = json_decode($_POST["mIds"]);
	global $CFG;
	if($CFG->conn === false)
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false) {
		die("db.php: Database connection error");
	}
	
	$stmt = $conn->prepare("DELETE FROM messages WHERE mId = ?");
	for($i = 0;$i < count($mIds);$i++) {
		$mId = $mIds[$i];
		$stmt->bind_param("i", $mId);
		$result = $stmt->execute();
		if($result === false)
			break;
	}
	if($result === false)
		return "{\"delete\" : \"failed\"}";
	return "{\"delete\" : \"succeed\"}";
}

function getApplications() {
	$query = "SELECT * FROM applications WHERE status = 2;";
	$result = sqlGetAllRows($query);
	for($i = 0;$i < count($result);$i++) {
		$result[$i]["passportPhoto"] = getFileName("passportPhoto", $result[$i]["mis"], false);
		$result[$i]["signature"] = getFileName("signature", $result[$i]["mis"], false);
		$result[$i]["SSCMarksheet"] = getFileName("SSCMarksheet", $result[$i]["mis"], false);
		$result[$i]["HSCMarksheet"] = getFileName("HSCMarksheet", $result[$i]["mis"], false);
		$result[$i]["competMarksheet"] = getFileName("competMarksheet", $result[$i]["mis"], false);
		$result[$i]["admitCard"] = getFileName("admitCard", $result[$i]["mis"], false);
		$result[$i]["incomeCert"] = getFileName("incomeCert", $result[$i]["mis"], false);
		$result[$i]["ecAct"] = getFileName("ecAct", $result[$i]["mis"], true);
		$query = "SELECT sId FROM applicationForScholarship WHERE aId = " . $result[$i]["aId"] . " ORDER BY sId;";
		$sId = sqlGetAllRows($query);
		$result[$i]["sId"] = $sId;
	}
	return json_encode($result);
}

function getFileName($name, $username, $isMultiple) {
	$files = glob("uploads/" . $username . $name . "*");
	return $files;
}
?>
