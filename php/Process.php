<?php
//script to update the GTM Configration 
//first, get the ID, Name & Products from the frontend, 
//second, delete all the records for that ID & Name
//third, add 1 record for each selected products for that ID & Name
if ($_SERVER["REQUEST_METHOD"] == "POST") 
{
	$u_id = $_POST["js_id"];
	// $u_cust_name = $_POST["js_cust_name"]; 
	// $u_flag = $_POST["js_flag"];
	
	// Database Access
	$servername = 'localhost';
	$username = 'root';
	$password = 'root';
	$dbname = 'test_db';

	// Create connection
	$conn = new mysqli($servername, $username, $password, $dbname);
	// Check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	} 

	$sql = "DELETE FROM `dataset_3` WHERE `ï»¿ID`=".$u_id.";";
	
	if ($result = $conn->query($sql) == TRUE)
	{
		//do nothing, query successfull
	}
	else 
	{
		echo "Error: " . $conn->error;
	}
	

	$sql = "INSERT INTO `dataset_3`(`Cust_ID`) VALUES ('".$u_id."')";
	if ($result = $conn->query($sql) == TRUE)
	{
		//echo "Configurations saved!";
	}
	else
	{
		echo "Error: " . $conn->error;
	}
	
	//finally, send the success msg after all records are inserted
	if($result)
	{
		echo "Configuration saved!";
	}
	
}
?>