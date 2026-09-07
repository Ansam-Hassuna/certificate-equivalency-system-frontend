import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {useLanguage} from "../context/LanguageContext";
import {PERMISSIONS} from "../auth/permissions";
import {RequirePermission} from "../auth/guards";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import FilterBar from "../components/ui/FilterBar";
import ScreenShell from "./workflow/ScreenShell";
import { getLocalizedRequestRows } from "./workflow/data";
import { QUALIFICATION_KEYS, requestMatchesFilters } from "../utils/requestFilters";

function Content(){
  const {t,language}=useLanguage();
  const navigate=useNavigate();
  const [search,setSearch]=useState("");
  const [filters,setFilters]=useState({qualification:"all",from:"",to:""});
  const [page,setPage]=useState(1);
  const pageSize=8;
  const archive=useMemo(()=>getLocalizedRequestRows(language).filter((row)=>row.archived),[language]);
  const filtered=useMemo(()=>archive.filter((row)=>requestMatchesFilters(row,{...filters,search})),[archive,filters,search]);
  const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize));
  const safePage=Math.min(page,pageCount);
  const rows=filtered.slice((safePage-1)*pageSize,safePage*pageSize);
  const setFilter=(key,value)=>{setFilters((current)=>({...current,[key]:value}));setPage(1)};
  const reset=()=>{setFilters({qualification:"all",from:"",to:""});setSearch("");setPage(1)};
  const qualificationOptions=QUALIFICATION_KEYS.map((item)=>({value:item.value,label:language==="ar"?item.ar:item.en}));
  const columns=[{key:"id",label:t("applications.id")},{key:"applicant",label:t("applications.applicant")},{key:"qualification",label:t("applications.qualification")},{key:"status",label:t("common.status")},{key:"date",label:t("applications.date")},{key:"actions",label:t("common.actions")}];
  return <ScreenShell title={t("archive.title")} description={language==="ar"?"الطلبات القديمة لا تظهر في القوائم النشطة، لكنها محفوظة ويمكن الوصول إليها من خلال البحث أو الأرشيف.":"Old requests are kept out of active lists but remain available through search and the archive."} icon="archive" stats={[
    {label:language==="ar"?"Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø¤Ø±Ø´Ù":"Archived",value:archive.length},
    {label:language==="ar"?"Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø­Ø§Ù„ÙŠØ©":"Current results",value:filtered.length},
    {label:language==="ar"?"Ø£Ù‚Ø¯Ù… Ø·Ù„Ø¨":"Oldest request",value:archive.length?archive[archive.length-1].date:"â€”"},
  ]}>
    <Card>
      <div className="archive-info-banner"><strong>{language==="ar"?"الأرشيف لا يعني الحذف":"Archive does not mean deletion"}</strong><span>{language==="ar"?"تبقى السجلات محفوظة ويمكن استرجاعها والبحث عنها عند الحاجة.":"Records remain preserved and can be found whenever needed."}</span></div>
      <FilterBar
        search={search}
        onSearch={(value)=>{setSearch(String(value??""));setPage(1)}}
        searchPlaceholder={language==="ar"?"ابحث في الأرشيف برقم الطلب أو الاسم...":"Search archive by request ID or name..."}
        labels={{filters:language==="ar"?"Ø§Ù„ÙÙ„Ø§ØªØ±":"Filters",reset:language==="ar"?"Ù…Ø³Ø­ Ø§Ù„ÙƒÙ„":"Clear all",apply:language==="ar"?"ØªØ·Ø¨ÙŠÙ‚":"Apply",active:language==="ar"?"Ø§Ù„ÙÙ„Ø§ØªØ± Ø§Ù„Ù†Ø´Ø·Ø©":"Active filters"}}
        filters={[
          {key:"qualification",label:language==="ar"?"Ø§Ù„Ù…Ø¤Ù‡Ù„":"Qualification",value:filters.qualification,defaultValue:"all",onChange:(v)=>setFilter("qualification",v),options:qualificationOptions},
          {key:"from",label:language==="ar"?"Ù…Ù† ØªØ§Ø±ÙŠØ®":"From date",value:filters.from,defaultValue:"",onChange:(v)=>setFilter("from",v),type:"date"},
          {key:"to",label:language==="ar"?"Ø¥Ù„Ù‰ ØªØ§Ø±ÙŠØ®":"To date",value:filters.to,defaultValue:"",onChange:(v)=>setFilter("to",v),type:"date"},
        ]}
        onReset={reset}
      />
      <p className="table-result-count">{language==="ar"?`عرض ${filtered.length} من ${archive.length} طلب مؤرشف`:`Showing ${filtered.length} of ${archive.length} archived requests`}</p>
    </Card>
    <Card>
      <Table columns={columns} rows={rows} renderCell={(row,col)=>col.key==="status"?<Badge tone="success">{row.status}</Badge>:col.key==="actions"?<Button variant="ghost" size="sm" onClick={()=>navigate(`/applications/${row.id}`)}>{t("common.view")} â†’</Button>:row[col.key]}/>
      <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage}/>
    </Card>
  </ScreenShell>
}
export default function Archive(){return <RequirePermission permission={PERMISSIONS.ARCHIVE_DOCUMENT}><Content/></RequirePermission>}

