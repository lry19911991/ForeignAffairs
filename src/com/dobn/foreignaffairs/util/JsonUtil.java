package com.dobn.foreignaffairs.util;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.StringUtils;

public class JsonUtil {
	public static Object json2Object(String json,Class clazz) {
		//{uid:'1',uname:'aa',upss:'11'}
		
		Object object = null;
		
		try {
			object = clazz.newInstance();
			
			json = json.replace("{", "").replace("}", "");
			String[] strings = json.split(",");
			for (String string : strings) {
				String[] strs = string.split(":");
				String name = strs[0];
				String value =strs[1].replace("'", "");
				
				BeanUtils.setProperty(object, name, value);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} 
		
		return object;
	}
	
	public static String object2Json(Object object) {
		StringBuffer buffer = new StringBuffer();
		
		Class clazz = object.getClass();
		
		List<String> list = new ArrayList<String>();	//name:'value'
		Field[] fields = clazz.getDeclaredFields();
		for (Field field : fields) {
			String name = field.getName();
			String value = "";
			try {
				value = BeanUtils.getProperty(object,name);
			} catch (Exception e) {
				e.printStackTrace();
			} 
			
			list.add(name + ":'"+value+"'");
		}
		
		buffer.append("{");
		buffer.append(StringUtils.join(list.iterator(), ","));
		buffer.append("}");
		
		return buffer.toString();
	}
	
	public static String list2Json(List list) {
		StringBuffer buffer = new StringBuffer();
		
		List<String> list2 = new ArrayList<String>();
		for (Object object : list) {	
			list2.add(object2Json(object));	//{uid:'1',uname:'aa',upss:'11'}
		}
		
		buffer.append("[");
		buffer.append(StringUtils.join(list2.iterator(),","));
		buffer.append("]");
		
		
		return buffer.toString();
	}

}













