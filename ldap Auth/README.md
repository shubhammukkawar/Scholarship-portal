#LDAP Authentication API

These files have been configured to authenticate users using COEP's LDAP server.

#Usage:
	
		require_once('adLDAP.php');

	1)	$ad = new adLDAP();

	2)	$dn = $ad->searchDn($username);	//$username is common name (cn) of a ldap node

	3)	$auth = $ad->authenticate($dn, $passwd);


If you already have the dn for a user (cn), you need not use the second line.

