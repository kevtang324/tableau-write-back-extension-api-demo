'use strict';

//load worksheet
 $(document).ready(function ()  {
    // Tell Tableau we'd like to initialize our extension
	
    tableau.extensions.initializeAsync().then(function () {
      //Fetch the saved sheet name from settings. This will be undefined if there isn't one configured yet
      //const savedSheetName = tableau.extensions.settings.get('sheet');
	  const savedSheetName = "Interface Details Table";
	  

	   loadSelectedMarks(savedSheetName);
	
      //initializeButtons();
    });
  });

// This variable will save  the function we can call to unregister listening to marks-selected events
let unregisterEventHandlerFunction;

  
//load selected mark
 function loadSelectedMarks (worksheetName) {

	if(unregisterEventHandlerFunction) 
	{
      unregisterEventHandlerFunction();
    }
	
    // Get the worksheet object we want to get the selected marks for
    const worksheet = getSelectedSheet("Interface Details Table");

    // Call to get the selected marks for our sheet
    worksheet.getSelectedMarksAsync().then(function (marks) 
	{
    
	// Get the selected mark
    const worksheetData = marks.data[0];

    // Map our data into the format which the data table component expects it
    const data = worksheetData.data.map(function (row, index) 
	{
        const rowData = row.map(function (cell) 
		{
          return cell.formattedValue;
        });

        return rowData;
    });

      // Populate the data table with the rows and columns we just pulled out
	  populateDataTable(data);
	  
    });
		
	// When the selection changes, reload the data
	unregisterEventHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) 
	{
			//using same above code
			worksheet.getSelectedMarksAsync().then(function (marks) 
			{

				const worksheetData = marks.data[0];
				const data = worksheetData.data.map(function (row, index) 
				{
					const rowData = row.map(function (cell) 
					{
					return cell.formattedValue;
					});
	
					return rowData;
				});
				populateDataTable(data);  
			});
	});
	
  } 
  
  //get the selected mark data and set to the text boxes & check boxes
  function populateDataTable (data) {
    
	var datastr = data.toString();
	
	var datasplit = datastr.split(",");
	
    if (data.length > 0) //if there is data, set the textboxes
	{
		$('#write_back_button').attr("disabled", false);
		$('#row_id').val(datasplit[9]);
		$('#scenario_key_id').val(datasplit[4]);
		$('#violation_location_id').val(datasplit[6]);
		$('#priority_id').val(datasplit[3]); //in data array, we are getting priority ID at index 0
	  
    } 
	else //if there is no data selected, disable the submit button & uncheck the check boxes
	{
      // If we didn't get any rows back, there must be no marks selected
	  	$('#row_id').val("Select any mark");
		$('#scenario_key_id').val("Select any mark");	
		$('#violation_location_id').val("Select any mark");
		$('#priority_id').val("");
		$("#write_back_button").attr("disabled", true);
    }

	checkTarget(); //update the checkboxes to set according to products present in the table
	
  }
  
  
//getting the targeted Products for Selected Customers, to initlize the checkboxes 
function checkTarget () {

	var row_id = document.getElementById("row_id").value;
	var scenario_key_id = document.getElementById("scenario_key_id").value;	
	var violation_location_id = document.getElementById("violation_location_id").value;	
	var priority_id = document.getElementById("priority_id").value;
	
	//passing ID & Name to PHP script to get the list of Targeted Products 
	$.post("php/checkTarget.php",
		{
			js_row_id: row_id,
			js_scenario_key: scenario_key_id,
			js_violation_location: violation_location_id,
            js_id: priority_id,
         },
		function(flag, status)  {
					
						$('#result').html(flag);
						
						//got the list of Products as a string separeted by comma
						//split the list of products and setting the checkboxes
						//alert(cust_id+" ; "+cust_name+" ; "+flag);
						// $('[value="'+flag+'"]').prop('checked',true); //set the checkboxes identified by values
						
		});

}  
 
  
//the function updates the GTM Configuration
function writeToDatabase () {	

	//getting values from the text boxes & checkboxes
	var row_id = document.getElementById("row_id").value;
	var scenario_key_id = document.getElementById("scenario_key_id").value;	
	var violation_location_id = document.getElementById("violation_location_id").value;	
	var priority_id = document.getElementById("priority_id").value;	
	// var cust_name = document.getElementById("cust_name").value;
	// var flag = document.getElementById("target_flag").value;
	
	//pass values to php script to do the update in the database -- using jQuery post method
	$.post("php/Process.php",
		{
			js_row_id: row_id,
			js_scenario_key: scenario_key_id,
			js_violation_location: violation_location_id,
            js_priority_id: priority_id,
            // js_cust_name: cust_name,
			// js_flag: flag
         },
		function(data, status)  {
					$('#result').html(data);
					alert(data); //getting back the msg from PHP script and printing it as alert
		});		  

		//refresh the data sources after updating to database
		refreshDataSource();
		
}



//get the worksheet which is selected i.e. Source Worksheet
function getSelectedSheet (worksheetName) {
   // Go through all the worksheets in the dashboard and find the one we want
   return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) 
	{
     return sheet.name === worksheetName;
   });
 }
  
  
  
// refresh data sources
tableau.extensions.initializeDialogAsync();
function refreshDataSource() 
{
    let dataSourceFetchPromises = [];
    let dashboardDataSources = {};
	
	const wksheet = getSelectedSheet("Interface Details Table");
	dataSourceFetchPromises.push(wksheet.getDataSourcesAsync());

	Promise.all(dataSourceFetchPromises).then(function (fetchResults) 
	{
        fetchResults.forEach(function (dataSourcesForWorksheet) 
		{
            dataSourcesForWorksheet.forEach(function (dataSource) 
			{
                if (!dashboardDataSources[dataSource.id]) 
				{
                    dashboardDataSources[dataSource.id] = dataSource;
                    dataSource.refreshAsync();
                }
            });
        });
    });
}