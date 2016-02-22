package com.dobn.foreignaffairs.action;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.Namespace;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.apache.struts2.convention.annotation.Results;
import org.springframework.stereotype.Controller;

@Namespace("/")
@ParentPackage("struts-default")
@Results({
	@Result(name = "ok", location = "/login.jsp")
})

@Controller
public class TestAction extends BaseAction {
	

	

//	@Autowired
//	private TestService testService;


	@Action("/login")
	public String execute() throws Exception {
		System.out.println("-----session"+session+"    request"+request+"        response"+response+"        contextPath"+contextPath);
		
		System.out.println("ActionContext.getContext().getValueStack()"+ServletActionContext.getContext().getValueStack());
		// TODO Auto-generated method stub	
//		Test test = new Test();
//		test.setUserName("ss");
//		test.setPassword("123456");
		
	//	testService.insert(test);
		return "ok";
	}

}
