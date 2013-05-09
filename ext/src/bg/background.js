// User Definitions (these can be change via the option page)
var u_username;
var u_apikey;
var u_notification;
var u_marketplace;
var u_pollInterval;
// Storage for polling
var s_lastSaleDate;
// Interval
var interval_id;
// Debug
var debug = 1;


function readSettings() {
	if(debug)
		console.log('Reading Settings');
	
  // Grab User Settings
  u_username      = localStorage["envato_username"];
  u_apikey        = localStorage["envato_key"];
  u_notification  = localStorage["envato_notifications"];
  u_marketplace   = localStorage["envato_marketplace"];
  u_pollInterval  = 5 * 1000 * 60;
  // Grab Poll Information
  s_lastSaleDate = localStorage["s_lastSaleDate"];
  
  if(s_lastSaleDate === 'undefined') {
    s_lastSaleDate = Date.parse('June 02, 1983 12:00:00');
    saveSaleDate(s_lastSaleDate);
  }
  if(u_marketplace === 'undefined') {
  	u_marketplace = 'http://marketplace.envato.com';
  }
}

function saveSaleDate(date){
	if(debug)
		console.log('Saving Sales Date');
		
  s_lastSaleDate                  = date;
  localStorage["s_lastSaleDate"]  = s_lastSaleDate ;
}

function checkEnvato() {
	if(debug)
		console.log('Checking Envato Website');
		
	readSettings();
  
  if(interval_id) {
    window.clearTimeout(interval_id);
  }
  interval_id = window.setTimeout(checkEnvato, u_pollInterval);
  
  if(!u_username || !u_apikey || !u_pollInterval) {
    chrome.browserAction.setBadgeText({text: '?'});
    return; 
  }
  
  // Lets Poll
  req = new XMLHttpRequest();
	req.open('GET', 'http://marketplace.envato.com/api/v2/' + u_username + '/' + u_apikey + '/recent-sales.json');
	req.onload = processRecentSales;
	req.send();
}

function updateBadge(count) {
	if(debug)
		console.log('Updating Badget Count');
		
  chrome.browserAction.setBadgeText({ text: '' + count + ''});
}

function showNotification(items, cost) {
	if(debug)
		console.log('Showing Desktop Notification');
		
  var notification = webkitNotifications.createNotification(
      '../../icons/icon48.png',
      'New Envato Marketplace Sale!',
      'Congratulations you sold the following items:\n\n' + items + '\n\nFor a total cost of: $' + parseFloat(cost)
  );
  
  notification.show();
}

function showDebug(message) {
	if(debug)
		console.log('Showing Debug Message');
		
  var notification = webkitNotifications.createNotification(
      '../../icons/icon48.png',
      'Envato Sales Notifications - DEBUG',
      message
  );
  
  notification.show();
}

// Add Listener incase the user clicks on the Icon 
chrome.browserAction.onClicked.addListener(
  function(tab) {
  	if(debug)
		console.log('Browser Action (Extension was clicked)');
		
    args = {
  	  'url': u_marketplace
  	};
  	
  	// Update Badge
  	updateBadge('');
  	
  	// Create new Tab
  	chrome.tabs.create(args);
   }
);

function processRecentSales(){
	if(debug)
		console.log('Processing JSON from Envato');
		
  var res = JSON.parse(req.responseText);
				
  if("error" in res) {  	
    console.log(res.error);
    
  	// Do not poll for 1 hour and 5 minutes
  	clearInterval(interval_id);
  	interval_id = setInterval(checkEnvato, 3900000)
  	
  	return;
  }
  
  var recent                = res["recent-sales"];
  var count_sales           = 0;
	var notification_content  = '';
	var total_amount          = 0;
	
	for(var i = recent.length -1; i >= 0; i--) {
		item_date = Date.parse(recent[i].sold_at);
		
		if(item_date > s_lastSaleDate) {
			saveSaleDate(item_date);
			count_sales ++;
			if(notification_content.length > 0) {
			  notification_content = notification_content + '\n';
			}
			notification_content  = notification_content + recent[i].item;
			total_amount          = total_amount + parseFloat(recent[i].amount);
		}
	}
	
	if(count_sales > 0) {
	  updateBadge(count_sales);
		
		
		if(u_notification == 1)
		{
		  showNotification(notification_content, total_amount)
		}
	} else {
		chrome.browserAction.setBadgeText({text: ''});
	}
}

checkEnvato();