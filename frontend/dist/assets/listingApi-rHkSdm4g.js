import{c}from"./index-B5iNW0qB.js";import{a as r}from"./axios.config-D6Aug8l7.js";/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],h=c("image",o);/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],k=c("navigation",g);/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["path",{d:"m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z",key:"wa1lgi"}],["path",{d:"m8.5 8.5 7 7",key:"rvfmvr"}]],f=c("pill",d);/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],_=c("plus",l);/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M11 2v2",key:"1539x4"}],["path",{d:"M5 2v2",key:"1yf1q8"}],["path",{d:"M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1",key:"rb5t3r"}],["path",{d:"M8 15a6 6 0 0 0 12 0v-3",key:"x18d4x"}],["circle",{cx:"20",cy:"10",r:"2",key:"ts1r5v"}]],v=c("stethoscope",u);/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],L=c("upload",p),w={createListing:async t=>{const s=await r("POST","/listing/create-listing",t);return s.success?{success:!0,data:s.data.data,message:s.data.message}:{success:!1,error:s.error}},getAllListings:async(t={})=>{const s=new URLSearchParams(Object.entries(t).filter(([i,n])=>n)).toString(),e=s?`/listing/get-all-listing?${s}`:"/listing/get-all-listing",a=await r("GET",e);return a.success?{success:!0,data:a.data.data||a.data,pagination:a.data.pagination}:{success:!1,error:a.error}},getListing:async t=>{const s=await r("GET",`/listing/get-listing/${t}`);return s.success?{success:!0,data:s.data.data}:{success:!1,error:s.error}},getMyListing:async(t={})=>{const s=new URLSearchParams(Object.entries(t).filter(([i,n])=>n)).toString(),e=s?`/listing/mylisting?${s}`:"/listing/mylisting",a=await r("GET",e);return a.success?{success:!0,data:a.data.data,count:a.data.count}:{success:!1,error:a.error}},updateListing:async(t,s)=>{const e=await r("PUT",`/listing/update-listing/${t}`,s);return e.success?{success:!0,data:e.data.data,message:e.data.message}:{success:!1,error:e.error}},updateListingStatus:async(t,s)=>{const e=await r("PATCH",`/listing/update-listing-status/${t}`,{status:s});return e.success?{success:!0,data:e.data.data,message:e.data.message}:{success:!1,error:e.error}},deleteListing:async t=>{const s=await r("DELETE",`/listing/delete-listing/${t}`);return s.success?{success:!0,message:s.data.message}:{success:!1,error:s.error}}};export{h as I,k as N,f as P,v as S,L as U,_ as a,w as l};
