import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import SearchBar from "../components/ui/SearchBar";
import FilterBar from "../components/ui/FilterBar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import ScreenShell from "./workflow/ScreenShell";
import { getLocalizedRequestRows } from "./workflow/data";
import { REQUEST_STATUS_KEYS, QUALIFICATION_KEYS, requestMatchesFilters } from "../utils/requestFilters";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import { useAuthorization } from "../auth/useAuthorization";

function Content(){
  const {t, language}=useLanguage();
  const navigate=useNavigate();
  const { can } = useAuthorization();
  const [search,setSearch]=useState("");
  const [page,setPage]=useState(1);
  const [view,setView]=useState("active");
  const [filters,setFilters]=useState({status:"all",qualification:"all",from:"",to:""});
  const pageSize=8;
  const allRows=useMemo(()=>getLocalizedRequestRows(language),[language]);
  const activeRows=allRows.filter((row)=>!row.archived);
  const archivedRows=allRows.filter((row)=>row.archived);
  const sourceRows=search.trim() && view === "active" ? [...activeRows,...archivedRows] : view === "archive" ? archivedRows : activeRows;
  const rows=useMemo(()=>sourceRows.filter((row)=>requestMatchesFilters(row,{...filters,search})),[sourceRows,filters,search]);
  const pageCount=Math.max(1,Math.ceil(rows.length/pageSize));
  const safePage=Math.min(page,pageCount);
  const pageRows=rows.slice((safePage-1)*pageSize,safePage*pageSize);
  const setFilter=(key,value)=>{setFilters((current)=>({...current,[key]:value}));setPage(1)};
  const resetFilters=()=>{setFilters({status:"all",qualification:"all",from:"",to:""});setSearch("");setPage(1)};
  const statusOptions=REQUEST_STATUS_KEYS.map((item)=>({value:item.value,label:language==="ar"?item.ar:item.en}));
  const qualificationOptions=QUALIFICATION_KEYS.map((item)=>({value:item.value,label:language==="ar"?item.ar:item.en}));
  const statusTone=(row)=>row.statusKey==="COMPLETED"?"success":row.statusKey==="AWAITING_INQUIRY"||row.statusKey==="DRAFT_REVIEW"?"warning":row.statusKey==="COMMITTEE"?"neutral":"neutral";
  const columns=[{key:"id",label:t("applications.id")},{key:"applicant",label:t("applications.applicant")},{key:"qualification",label:t("applications.qualification")},{key:"university",label:t("applications.university")},{key:"status",label:t("common.status")},{key:"date",label:t("applications.date")},{key:"actions",label:t("common.actions")}];
  const canCreate = can(PERMISSIONS.APPLICATION_CREATE);
  return <ScreenShell title={t("applications.title")} description={t("applications.description")} icon="document" stats={[
    {label:t("applications.stats.total"),value:activeRows.length},
    {label:t("applications.stats.review"),value:activeRows.filter(r=>r.statusKey==="UNDER_REVIEW").length},
    {label:t("applications.stats.inquiry"),value:activeRows.filter(r=>r.statusKey==="AWAITING_INQUIRY").length},
    {label:t("applications.stats.committee"),value:activeRows.filter(r=>r.statusKey==="COMMITTEE").length},
  ]} actions={canCreate ? <Button onClick={()=>navigate("/applications/new")} icon={<Icon name="plus" size={18}/>}>{t("applications.new")}</Button> : null}>
    <Card>
      <div className="request-list-tabs" role="tablist">
        <button type="button" className={view==="active"?"request-list-tab active":"request-list-tab"} onClick={()=>{setView("active");setPage(1)}}>{language==="ar"?"الطلبات النشطة":"Active requests"}<span>{activeRows.length}</span></button>
        <button type="button" className={view==="archive"?"request-list-tab active":"request-list-tab"} onClick={()=>{setView("archive");setPage(1)}}>{language==="ar"?"الأرشيف":"Archive"}<span>{archivedRows.length}</span></button>
      </div>
      <div className="dashboard-table-heading"><div><h2>{view==="archive"?(language==="ar"?"الطلبات المؤرشفة":"Archived requests"):t("applications.title")}</h2><p>{language==="ar"?`عرض ${rows.length} من ${sourceRows.length} طلب`:`Showing ${rows.length} of ${sourceRows.length} requests`}</p></div></div>
      <FilterBar
        search={search}
        onSearch={(value)=>{setSearch(String(value??""));setPage(1)}}
        searchPlaceholder={language==="ar"?"ابحث برقم الطلب أو الاسم أو الحالة...":"Search by request, name or status..."}
        labels={{filters:language==="ar"?"الفلاتر":"Filters",reset:language==="ar"?"مسح الكل":"Clear all",apply:language==="ar"?"تطبيق":"Apply",active:language==="ar"?"الفلاتر النشطة":"Active filters"}}
        filters={[
          {key:"status",label:language==="ar"?"الحالة":"Status",value:filters.status,defaultValue:"all",onChange:(v)=>setFilter("status",v),options:statusOptions},
          {key:"qualification",label:language==="ar"?"المؤهل":"Qualification",value:filters.qualification,defaultValue:"all",onChange:(v)=>setFilter("qualification",v),options:qualificationOptions},
          {key:"from",label:language==="ar"?"من تاريخ":"From date",value:filters.from,defaultValue:"",onChange:(v)=>setFilter("from",v),type:"date"},
          {key:"to",label:language==="ar"?"إلى تاريخ":"To date",value:filters.to,defaultValue:"",onChange:(v)=>setFilter("to",v),type:"date"},
        ]}
        onReset={resetFilters}
      />
    </Card>
    <Card>
      <Table columns={columns} rows={pageRows} renderCell={(row,col)=>col.key==="status"?<Badge tone={statusTone(row)}>{row.status}</Badge>:col.key==="actions"?<Button variant="ghost" size="sm" onClick={()=>navigate(`/applications/${row.id}`)}>{t("common.view")} →</Button>:row[col.key]}/>
      <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage}/>
    </Card>
  </ScreenShell>
}
export default function Applications(){return <RequirePermission permission={PERMISSIONS.VIEW_APPLICATIONS}><Content/></RequirePermission>}
