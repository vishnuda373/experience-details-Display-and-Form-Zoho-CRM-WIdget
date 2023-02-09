var button = document.getElementById("btnsubmit");
var togglebtn = document.getElementById("togglebtn");
var leadId;
var entity;
var resetbtn=document.getElementById("btnreset");
var currentjob=document.getElementById("currentjob");
var entrySelector= document.getElementById("selector");

//*****************Page Load************************* */
ZOHO.embeddedApp.on("PageLoad", function (data) {
  console.log(data);
  leadId = data.EntityId;
  entity = data.Entity;
  console.log(`Entity=${entity}`);
  console.log(`Entity Id=${leadId}`);
  fetchData();
  document.getElementById("successModal").showModal();
});

//*******************************************FUNCTIONS***********************************************************/

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Date Formatter<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function GetFormattedDate(inputdate) {
  var month = format(inputdate .getMonth() + 1);
  var day = format(inputdate .getDate());
  var year = format(inputdate .getFullYear());
  return day  + "-" + month+ "-" + year;
}
//>>>>>>>>>>>>>>>>>>>>>>>Fetch Details from module and show it in the table <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
var related_data;
function fetchData() {
  document.getElementById("tablebody").innerHTML = "";
  var resp_related = ZOHO.CRM.API.searchRecord({
    Entity: "Experiences",
    Type: "criteria",
    Query: `(Lead:equals:${leadId})`,
    delay: false,
  }).then(function (resp) {
    console.log(`Related Data=${resp}`);
    console.log(resp);
    related_data = resp.data;
    if (related_data != undefined) {
      related_data.sort(function (a, b) {
        return new Date(b.To) - new Date(a.To);
      });

      var tablebody = document.getElementById("tablebody");
      related_data.forEach((element) => {
        var row = tablebody.insertRow(0);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);

        cell1.innerHTML = element.Name;
        cell2.innerHTML = element.Company;
        cell3.innerHTML = element.From;
        if(element.Current_Job == true){
          cell4.innerHTML ="Current Job"
        }
        else{
          cell4.innerHTML = element.To;
        }
        
      });
    }
  });
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*Control button function<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function controlButton() {
  console.log("Clicked on Toggle Button");
  if (togglebtn.innerHTML === "Add New Experience") {
    document.getElementById("todate").style="opacity:1";
    document.getElementById("table").classList.add("hide")
    handleDate();
    togglebtn.innerHTML = "Close X";
    togglebtn.classList.toggle("bg-danger");
    document.getElementById("formelements").style = "display:inherit";
  } else {
    togglebtn.innerHTML = "Add New Experience";
    togglebtn.classList.toggle("bg-danger");
    document.getElementById("formelements").style = "display:none";
    document.getElementById("table").classList.remove("hide")
  }
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Handle date in the form based on previous Inputs <<<<<<<<<<<<<<<<<<<<<<<<<<<
function handleDate() {
  console.log(related_data)
    //inputting to date as todays
    var date=new Date()
    var day=date.getDate()
    var month=date.getMonth()
    var year=date.getFullYear();
    console.log(`New Date=${day} ${month} ${year}`);
    document.getElementById("to").value=`${year}-${month+1}-${day}`
    //inputting from date as the last date 
    if(related_data!=undefined){
        console.log("related data obtained")
        related_data.sort(function(a,b){
            return new Date(b.To) - new Date(a.To);
          });
        var last_experience_date=related_data[0].To
        document.getElementById("from").value=`${last_experience_date}`
    }
    else{
        ZOHO.CRM.API.searchRecord({Entity:"Education",Type:"criteria",Query:`(Lead:equals:${leadId})`,delay:false})
        .then(function(resp){
            console.log("fetched education")
            console.log(resp)
            const respdata=resp.data
            if(respdata!=undefined){
                respdata.sort(function(a,b){
                    return new Date(b.Date_of_Completion) - new Date(a.Date_of_Completion);
                    });
                var last_education_date=respdata[0].Date_of_Completion
                console.log(`Last education date=${last_education_date}`)
                document.getElementById("from").value=last_education_date;
            }
        })
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Form Submit<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
button.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("cover-spin").style="display:inherit";
  console.log(`Clicked`);
  var recordData
  if (document.getElementById("selector").value== "Experience") {
    recordData={
      Name: document.getElementById("jobtitle").value,
      From: document.getElementById("from").value,
      To: document.getElementById("to").value,
      Company: document.getElementById("company").value,
      Job_Responsibility: document.getElementById("responsibility").value,
      Is_Experience_Related_to_Higher_Qualification:
      document.getElementById("relation").value,
      Lead: leadId,
      Current_Job:document.getElementById("currentjob").checked
    };
  }
  else if (document.getElementById("selector").value== "Year Gap") {

    recordData={
      Name: "Year Gap",
      From: document.getElementById("from").value,
      To: document.getElementById("to").value,
      Lead: leadId,
    };
  }
  
  ZOHO.CRM.API.insertRecord({
    Entity: "Experiences",
    APIData: recordData,
    Trigger: ["workflow", "approval"],
  }).then(function (resp) {
    console.log(resp);
    fetchData();
    controlButton();
    document.getElementById("table").classList.remove("hide");
    document.getElementById("inputform").reset();
    document.getElementById("cover-spin").style="display:none";   
  });
});
//***********************************Button Clicks*************************************************

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>Reset Button<<<<<<<<<<<<<<<<<<<<<<<<<<
resetbtn.addEventListener("click",(e)=>{
  e.preventDefault();
  document.getElementById("inputform").reset();
})

//>>>>>>>>>>>>>>>>>>>>>>>>>Toggle Button<<<<<<<<<<<<<<<<<<<<<<<<<<<
togglebtn.addEventListener("click", controlButton);

//>>>>>>>>>>>>>>>>>>>>>>>>>Current Job Button<<<<<<<<<<<<<<<<<<<<<
currentjob.addEventListener("change",(e)=>{
  if(document.getElementById("currentjob").checked == true){

    document.getElementById("todate").style="opacity:0";
  }
  else{
    document.getElementById("todate").style="opacity:1";
  }
})
//>>>>>>>>>>>>>>>Input selector(Experience or year gap)<<<<<<<<<
entrySelector.addEventListener("change",(e)=>{
if(document.getElementById("selector").value== "Year Gap"){
  document.getElementById("currentjobDiv").style="display:none";
  document.getElementById("jobResp").style="display:none";
  document.getElementById("companyDiv").style="display:none";
  document.getElementById("expQualification").style="display:none";
  document.getElementById("titleDiv").style="display:none";
}
else if(document.getElementById("selector").value== "Experience"){
  document.getElementById("currentjobDiv").style="display:block";
  document.getElementById("jobResp").style="display:block";
  document.getElementById("companyDiv").style="display:block";
  document.getElementById("expQualification").style="display:block";
  document.getElementById("titleDiv").style="display:block";
}

})

ZOHO.embeddedApp.init();