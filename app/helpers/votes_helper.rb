module VotesHelper
  def sp_input text,id=nil,type="text",required=true
    content_tag(:div,class: "form-group") do
      content_tag(:label,text,for: id,class: "form-label") +
      content_tag(:input,nil,type: type,placeholder: text,id: id,class: "form-input",required: required)
    end
  end

  def logout_btn
    content_tag(:button, '',class: 'btn',id: 'logout') do
      content_tag(:i,'',class: 'icon icon-back')+
        content_tag(:span,'登出')
    end
  end

  def tw_time source
    (source.year-1911).to_s+"年"+source.localtime.strftime('%2m月%2d日%2H點%2M分')
  end

  def to_word number
    case number
    when 1 then '一'
    when 2 then '二'
    when 3 then' 三'
    when 4 then '四'
    when 5 then '五'
    when 6 then '六'
    when 7 then '七'
    when 8 then '八'
    when 9 then '九'
    when 10 then '十'
    else "?"
    end
  end
end
