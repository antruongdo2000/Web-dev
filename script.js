


function Validator(options) {
 
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
        }
        element = element.parentElement;
    }

    var selectorRules = {};

    function Validate(inputElement, rule){
        var errorMessage;
        // = rule.test(inputElement.value);
        // var errorElement = inputElement.parentElement.querySelector(options.errorSelector);

        var getParentElement = getParent(inputElement, options.formGroupSelector);

        var errorElement = getParentElement.querySelector(options.errorSelector);

        //Lấy ra rule của selector
        var rules = selectorRules[rule.selector];

        //Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng kiểm tra
        for (let index in rules){
            errorMessage = rules[index](inputElement.value);
            if (errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParentElement.classList.add("invalid");
        }
        else {
            errorElement.innerText = '';
            getParentElement.classList.remove("invalid");
        }

        return !errorMessage;
    }

    //Lấy element của form
    var formElement = document.querySelector(options.form);

    if (formElement){

        formElement.onsubmit = (e) => {
            e.preventDefault();

            var isFormValid = true;

            //Thực hiện lặp qua từng rule và validate
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule);

                if (!isValid) {
                    isFormValid = false;
                }
            });

            //Lấy dữ liệu người dùng nhập vào
            if (isFormValid) {
                if (typeof options.onSubmit === "function") {
                    
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    console.log("Enable Input: ",enableInputs);
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        values[input.name] = input.value;
                        return values;
                    }, {});

                    console.log("Không có lỗi");

                    options.onSubmit(formValues);
                }
                else {
                    formElement.submit();
                }
            }
            else {
                console.log("Có lỗi");
            }
        }


        //Xử lí lặp qua mỗi rule và xử lí (lắng nghe sự kiện blur, input, ....)
        options.rules.forEach(function(rule){

            //Lưu lại các rules cho mỗi input element
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            
            if (inputElement){
                //Xử lí blur
                inputElement.onblur = function(){
                    Validate(inputElement, rule);
                }

                //Xử lí trường hợp khi nhập vào input
                inputElement.oninput = function(){
                    var errorElement = getParentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParentElement.classList.remove("invalid");
                }
            }
        });
    }
}

// Định nghĩa rule cho form
// Nguyên tắc của các rule:
//1. Khi có lỗi => Trả ra mess lỗi
//2. khi hợp lệ => không trả ra
    Validator.isRequired = function (selector) {
        return {
            selector: selector,
            test: function (value){
                return value.trim() ? undefined : "Vui lòng nhập trường này";
            }
        };
    }

    Validator.isEmail = function (selector) {
        return {
            selector: selector,
            test: function (value){
                var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

                //test này khác với test key ở trên
                return regex.test(value.trim()) ? undefined : "Trường này phải là email";
            }
        };
    }

    Validator.minLength = function (selector, min) {
        return {
            selector: selector,
            test: function (value){
                return value.trim().length >= min ? undefined : `Vui lòng nhập ${min} kí tự trở lên`;
            }
        };
    }

    Validator.isConfirmed = function (selector, getConfirmValue, message) {
        return {
            selector: selector,
            test: function (value){
                return value.trim() === getConfirmValue() && value.trim() ? undefined : message || "Giá trị nhập vào không chính xác";
            }
        };
    }