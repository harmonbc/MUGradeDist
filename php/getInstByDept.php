<?php

$dept = $_GET["dept"];

$query = ("SELECT I.name FROM INSTRUCTORS as I JOIN works_in AS W on W.iid=I.iid WHERE W.did == ".$dept);

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
