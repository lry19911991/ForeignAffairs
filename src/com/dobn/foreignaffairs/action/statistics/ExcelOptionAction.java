package com.dobn.foreignaffairs.action.statistics;

import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.Namespace;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.apache.struts2.convention.annotation.Results;
import org.springframework.stereotype.Controller;

import com.opensymphony.xwork2.ActionSupport;

@Namespace("/")
@ParentPackage("json-default")
@Results( {
	@Result(name="ok",location="aaa.jsp")
})
@Controller
public class ExcelOptionAction extends ActionSupport {

	@Action("ExportExcelAction")
	public String export() throws Exception {
		// TODO Auto-generated method stub
		
		return "ok";
	}

	
}
