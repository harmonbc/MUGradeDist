<?php
$data = array(
                "CID"=>$_POST['cid'],
        );

$getClasses = sprintf("select * from grades AS g JOIN class as C ON C.cid = g.cid JOIN departments AS d ON d.did = C.did where c.cid=%s ", $data['CID']);
$db = new SQLite3('../db/grades.db');                        
$result = $db -> query($getClasses);

$row = array();
$i = 0;
while($res = $result -> fetchArray(SQLITE3_ASSOC)){
  $row[$i] = $res;
  $i++;
}
header('Content-Type: application/json');
echo json_encode($row);
?>
