<?php
/*This function creates a connection with the database*/
function dbConnect() {
	global $CFG;
	$conn = new mysqli($CFG->server, $CFG->db_user, $CFG->db_pass, $CFG->db_database);
	if($conn->error) {
		die("connection error ". $conn->error . "<br>"); 
		return false;
	}
	$CFG->conn = $conn;
	return $conn;
}

function sqlGetAllRows($query) {
	global $CFG;
	if($CFG->conn === false) 
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false) {
		die("Database connection error");
	}
	$result = $conn->query($query);
	error_log($conn->error);
	if($result === false)  {
		die("Query returned false");
	}
	$allrows = array();
	$allrows = $result->fetch_all(MYSQLI_ASSOC);
	return $allrows;
}

function sqlGetOneRow($query) {
	global $CFG;
	if($CFG->conn === false) 
		$conn = dbConnect();
	else
		$conn = $CFG->conn;
	if($conn === false) {
		die("Database connection error");
	}
	$result = $conn->query($query);
	if($result === false)  {
		die("Query returned false");
	}
	$allrows = array();
	$allrows = $result->fetch_all(MYSQLI_ASSOC);
	if(count($allrows) != 1) {
		return false;
	}
	return $allrows;
}

?>
