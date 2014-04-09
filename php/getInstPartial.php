<?php

$partial = strtolower($_GET['partial']);
$did = $_GET['did'];

$query = "";

if($did > 0){
	$query = sprintf( "SELECT i.name FROM instructors AS i JOIN works_in as d on d.iid = i.iid WHERE i.name LIKE '%%%s%%' AND d.did == %s",$partial, $did);
}else{
	$query = sprintf("SELECT i.name FROM instructors AS i JOIN works_in as d on d.iid = i.iid WHERE i.name LIKE '%%%s%%' GROUP BY i.iid", $partial);
}

$db = new SQLite3('../db/grades.db');                        
$result = $db -> query($query);

$row = array();
$i = 0;

while($res = $result -> fetchArray(SQLITE3_ASSOC)){
  $row[$i] = $res;
  $i++;
}

header('Content-Type: application/json');
echo json_encode($row);
?>
