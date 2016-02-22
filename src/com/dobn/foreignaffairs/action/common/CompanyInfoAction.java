package com.dobn.foreignaffairs.action.common;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.Namespace;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.apache.struts2.convention.annotation.Results;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import com.dobn.foreignaffairs.bean.common.OfficeInfo;
import com.dobn.foreignaffairs.service.common.impl.CompanyInfoService;
import com.dobn.foreignaffairs.util.JsonUtil;
import com.opensymphony.xwork2.ActionSupport;

@Namespace("/")
@ParentPackage("json-default")
@Results( {
	@Result(name="searchEntAwarenessAop",location="/jsp/QueryStatistics/EntAwarenessInfo.jsp")
	

})
@Controller
public class CompanyInfoAction extends ActionSupport {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private CompanyInfoService companyInfoService;
	
	@Autowired
	public void setCompanyInfoService(CompanyInfoService companyInfoService) {
		this.companyInfoService = companyInfoService;
	}

	@Action("/searchCompanyInfo")
	public void searchCompanyInfo() {
		try {
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("CompanyInfo.type", 1);
//			map.put("CompanyInfo.flag", 0);
		List<OfficeInfo> selectCompanyInfoList = companyInfoService.selectCompanyInfoList(map);
		String list2Json = JsonUtil.list2Json(selectCompanyInfoList);
		System.out.println(list2Json);
		JSONObject jo = new JSONObject();
		jo.put("list", selectCompanyInfoList);
		HttpServletResponse response = ServletActionContext.getResponse();
		PrintWriter writer = null;
		writer = response.getWriter();
		writer.print(jo);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
