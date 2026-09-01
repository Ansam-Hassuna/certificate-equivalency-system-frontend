import React from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { REQUESTS } from "../data/requests";
export default function RequestDetails(){ const {id}=useParams(); const {language}=useLanguage(); const request=REQUESTS.find((item)=>item.id===id); if(!request) return <div className="page"><h1>{language === "ar" ? "الطلب غير موجود" : "Request not found"}</h1></div>; return <div className="page"><h1>{language === "ar" ? "تفاصيل الطلب" : "Request details"}</h1><section className="card"><p><strong>{language === "ar" ? "رقم الطلب:" : "Request ID:"}</strong> {request.id}</p><p><strong>{language === "ar" ? "مقدم الطلب:" : "Applicant:"}</strong> {request.applicant}</p><p><strong>{language === "ar" ? "نوع الطلب:" : "Request type:"}</strong> {request.type}</p><p><strong>{language === "ar" ? "الحالة:" : "Status:"}</strong> {request.status}</p></section></div>; }
