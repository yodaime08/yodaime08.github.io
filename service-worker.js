/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
//'use strict';

//Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

const FORECAST_DELAY = 0;

//List of files to cache here.
const FILES_TO_CACHE = [
  '/offline.html',
];

/*const applicationServerPublicKey = 'BHQ2zREJPg_3gRLkilQURwst-AkWliJt1FX2Hzkp_39UDgbTx6UW5TeyrY1IUxIMDBPnbjLcs07ba8zHXxChsBM';*/
var applicationServerPublicKey = 'init';

self.addEventListener('install', (evt) => 
{
	console.log('[ServiceWorker] Install');
	// Precache static resources here.
	evt.waitUntil
	(
		caches.open(CACHE_NAME).then((cache) => 
		{
			console.log('[ServiceWorker] Pre-caching offline page');
			return cache.addAll(FILES_TO_CACHE);
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', async () => 
{
	console.log('[ServiceWorker] Activate');
	
	// Remove previous cached data from disk.
	caches.keys().then((keyList) => 
	{
		return Promise.all(keyList.map((key) => 
		{
			if (key !== CACHE_NAME) 
			{
				console.log('[ServiceWorker] Removing old cache', key);
				return caches.delete(key);
			}
		}));
	});
	self.clients.claim();

	// This will be called only once when the service worker is activated.
	try
	{
		var applicationServerPublicKey = await getVAPIDPublicKey() ;
		const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey.value);
		const options = { applicationServerKey, userVisibleOnly: true };
		const subscription = await self.registration.pushManager.subscribe(options);
		console.log(JSON.stringify(subscription));
		const response = await saveSubscription(subscription);
		console.log(response);
	} 
	catch (err) 
	{
		console.log('[ServiceWorker] Error', err);
	}
})

self.addEventListener('fetch', (evt) => 
{
	//console.log('[ServiceWorker] Fetch', evt.request.url);
	// Fetch event handler.
	if (evt.request.mode !== 'navigate') 
	{
		// Not a page navigation, bail.
		return;
	}
	evt.respondWith
	(
		fetch(evt.request).catch(() => 
		{
			return caches.open(CACHE_NAME).then((cache) => 
			{
				return cache.match('offline.html');
			});
		})
	);
});

self.addEventListener('push', (evt) => 
{
	console.log('[Service Worker] Push Received.');
	console.log(`[Service Worker] Push had this data: "${evt.data.text()}"`);
	
	var notificationText = evt.data.text();

	const title = 'Raid PoGo';
	const options = {
		body: notificationText,
		icon: 'images/icons/icon-192x192.png',
		badge: 'images/icons/icon-192x192.png'
	};

	evt.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (evt) => 
{
	evt.notification.close();
	console.log('[Service Worker] Notification closed.');
});

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
const urlB64ToUint8Array = base64String => 
{
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray;
};

const saveSubscription = async subscription => 
{
	const SERVER_URL = "http://localhost:4000/save-subscription";
	const response = await fetch(SERVER_URL, 
	{
		method: "post",
		headers: {
		"Content-Type": "application/json"
		},
		body: JSON.stringify(subscription)
	});
	return response.json();
};

const getVAPIDPublicKey = async applicationServerPublicKey => 
{
	const SERVER_URL = "http://localhost:4000/get-keys";
	
	var myHeaders = new Headers();

	var myInit = { 	method: 'GET',
					headers: {
						"Content-Type": "application/json"
					}	
					//,mode: 'cors'
					//,cache: 'default' 
				};
	
	const response = await fetch(SERVER_URL, 
	{
		method: "GET",
		headers: { "Content-Type": "application/json" }
	});
	
	return response.json();

};


