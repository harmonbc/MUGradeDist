<?php


$query = sprintf("SELECT iid FROM instructors WHERE name == '%s'", $_GET['inst']);

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
