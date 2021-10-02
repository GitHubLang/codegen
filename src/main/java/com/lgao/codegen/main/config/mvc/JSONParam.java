package com.lgao.codegen.main.config.mvc;

import java.lang.annotation.*;

@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface JSONParam {
    String value() default "";
    boolean isArray() default true;
    boolean required() default true;
}
