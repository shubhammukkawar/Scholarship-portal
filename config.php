<?php
		unset($CFG);
		global $CFG;

		$CFG = new stdClass();

		$CFG->db_type = "mysqli";
		$CFG->db_user = "root";
		$CFG->db_pass = "password";
		$CFG->db_database = "task1";
		$CFG->server = "localhost";
		$CFG->port = "3306";
		$CFG->conn = false;
?>
