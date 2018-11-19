<?php
require_once('config.php');
require_once('database.php');
//require_once('ldap Auth/adLDAP.php');

$reqType = $_POST['reqType'];
session_start();
echo $reqType();
	
function validateUser() {
		header("Content-Type: application/JSON; charset=UTF-8");
		$username = $_POST['username'];
		$password = md5($_POST['password']);
		
		//$ad = new adLDAP();
		//$dn = $ad->searchDn($username);
		//$auth = $ad->authenticate($dn, $password);
		/*$dn = "dc=coep,dc=org,dc=in";
		$ds = ldap_connect("10.1.101.41", 389);
		ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);
   		ldap_set_option($ds, LDAP_OPT_REFERRALS, 0);
   		$auth = ldap_bind($ds);
		if($auth !== false) {
			$filter="(&(cn=$username))";
			$sr = ldap_search($ds, $dn, $filter);
			$info = ldap_get_entries($ds, $sr);
			if($info["count"] === 1) {*/
				$query = "select * from users where mis = \"$username\";";
				$row = sqlGetOneRow($query);
				if($row != false) {
					$_SESSION['username'] = $username;
					$_SESSION['role'] = $row[0]['user'];
					$resString = "{\"Login\" : \"succeed\", \"role\" :". $_SESSION['role'] ."}";
				}
				else {
					$resString = "{\"Login\" : \"failed\"}";
				}
			/*}
			else
				$resString = "{\"Login\" : \"failed\"}";
		}
		else {
			$resString = "{\"Login\" : \"failed\"}";
		}*/
		return $resString;
}

function isLoggedIn() {
	header("Content-Type: application/JSON; charset=UTF-8");
	if(isset($_SESSION['username']) and isset($_SESSION['role'])) {
		return "{\"Login\" : \"succeed\", \"role\" :". $_SESSION['role'] ." , \"username\" : \"". $_SESSION['username'] . "\"}";
	}
	else {
		return "{\"Login\" : \"failed\"}";
	}
}

function logout() {
	unset($_SESSION['username']);
	unset($_SESSION['role']);
	session_destroy();
	return "{\"Logout\" : \"succeed\"}";
}

?>
