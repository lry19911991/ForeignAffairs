package com.dobn.foreignaffairs.util;

/**
 * 字符串工具类
 * @author sunjun
 *
 */
public class StringUtils {
	/**
	 * null验证
	 * @param str
	 * @return 字符串空
	 */
	public static String checkNull(String str){
		if(null != str && !"".equals(str)){
			return str;
		}else{
			return "";
		}
	}
	public static boolean checkNullBool(String str){
		if(null != str && !"".equals(str)){
			return true;
		}else{
			return false;
		}
	}
	/**
	 * null验证
	 * @param str
	 * @return 字符串"-"
	 */
	public static String checkNullDis(String str){
		if(null != str && !"".equals(str)){
			return str;
		}else{
			return "-";
		}
	}
}
