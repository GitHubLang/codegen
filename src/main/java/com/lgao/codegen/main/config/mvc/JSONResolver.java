package com.lgao.codegen.main.config.mvc;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import javax.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Component
public class JSONResolver  implements HandlerMethodArgumentResolver {



    @Override
    public boolean supportsParameter(MethodParameter methodParameter) {
        return methodParameter.hasParameterAnnotation(JSONParam.class);
    }

    @Override
    public Object resolveArgument(MethodParameter methodParameter, ModelAndViewContainer modelAndViewContainer, NativeWebRequest nativeWebRequest, WebDataBinderFactory webDataBinderFactory) throws Exception {

        //得到 JSONRequestParam 注解信息并将其转换成用来记录注解信息的 JSONRequestParamNamedValueInfo 对象
        JSONParam jsonRequestParam = methodParameter.getParameterAnnotation(JSONParam.class);
        String parameterName = methodParameter.getParameterName();
        boolean required = jsonRequestParam.required();
        boolean array = jsonRequestParam.isArray();
        String value1 = jsonRequestParam.value();



        HttpServletRequest servletRequest = nativeWebRequest.getNativeRequest(HttpServletRequest.class);

        //获得对应的 value 的 JSON 字符串
        String jsonText = servletRequest.getParameter(parameterName);

        if (jsonText==null||jsonText.isEmpty()) {

                throw new IllegalArgumentException(
                        "未找到传入参数：" + parameterName + " ,Name for argument type [" + methodParameter.getNestedParameterType().getName() +
                                "] not available, and parameter name information not found in class file either.");
        }

        List<Map<String,Object>> listMap = new ArrayList<>();

        if(JSONObject.isValidArray(jsonText)){

            JSONArray objects = JSONObject.parseArray(jsonText);
            for (int i = 0; i <objects.size() ; i++) {
                listMap.add((Map)objects.get(i));
            }

        }else if(JSONObject.isValid(jsonText)){

            listMap.add((Map)JSONObject.parse(jsonText));

        }else{

            throw new IllegalArgumentException(
                    "jsons格式不合法："+jsonText
            );

        }

        return listMap;
    }
}
