$(document).ready(()=>{
  var msg_queue = []
  var sys_msg_running = false
  var show_sys_msg = ()=>{ // type: 1->primary, 2-> success, 3-> error
    sys_msg_running = true
    var msg = msg_queue.shift()
    switch(msg.type){
      case 1:
        var classlist = "label label-primary visible"
        break
      case 2:
        var classlist = "label label-success visible"
        break
      case 3:
        var classlist = "label label-error visible"
        break
    }
    $("#sys_msg>#sys_msg_content").text(msg.text)
    $("#sys_msg").attr("class",classlist)
    setTimeout(()=>{
      $("#sys_msg").removeClass("visible")
    },3000)
    setTimeout(()=>{
      if(msg_queue.length > 0){
        show_sys_msg()
      }else{
        sys_msg_running = !sys_msg_running
      }
    },3500)
  }
  var error_bounce = ()=>{
    $("#main").addClass("changing")
    setTimeout(()=>{
      $("#main").removeClass("changing")
    },200)
  }
  var add_msg_to_queue = (type,text)=>{
    msg_queue.push({text: text, type: type})
    if(!sys_msg_running){
      show_sys_msg()
    }
  }
  var dont_give_me_that_face = (y)=>{
    $("#face").css("top",y)
    $("#face").addClass("changing")
    setTimeout(()=>{
      $("#face").removeClass("changing")
    },2000)
  }
  var login_again_plz = ()=>{
    add_msg_to_queue(1,"登入失效，請重新登入(´・ω・｀)")
    setTimeout(()=>{
      window.location = "/"
    },2000)
  }
  var admin_login_again_plz = ()=>{
    add_msg_to_queue(1,"登入失效，請重新登入(´・ω・｀)")
    setTimeout(()=>{
      window.location = "/admin"
    },2000)
  }
  var voter_signin = ()=>{
    if($("input:invalid").length === 0){
      var formData = {account: $("#account").val(),passwd: $("#passwd").val(),id: $("h3.title").data('id')}
      $.ajax({
        url: "/valid",
        cache: false,
        type: 'POST',
        data: formData,
        beforeSend: ()=>{
          $("#govote").addClass('loading')
        },
        success: (html)=>{
          $("#main").addClass("fade-out")
          setTimeout(()=>{
            $("#main").removeClass("fade-out").html(html)
            add_msg_to_queue(1,"嗨!"+$("#you-cant-see-me").text()+"(´・ω・｀)")
            $(".step-item").removeClass("active")
            if(html.includes('結果揭曉')){
              $(".step-item:nth-of-type(4)").addClass("active")
            }else if(html.includes('OK, 我知道了')){
              $(".step-item:nth-of-type(3)").addClass("active")
              limit = $("#limit").data('limit')
              current_count = 0
              vote_targets = []
            }else{
              timeup_check(html)
            }
          },500)
        },
        error: ()=>{
          error_bounce()
          $("input")[0].select()
          add_msg_to_queue(3,"登入失敗，請檢查帳號密碼是否正確(・_・)")
        },
        complete: ()=>{
          $("#govote").removeClass("loading")
        }
      })
    }else{
      $("input:invalid")[0].focus()
    }
  }
  var timeup_check = (response)=>{
    if(response.includes('目前並沒有可參與的投票')){
      $("h3.title").text('')
      $(".step-item").removeClass('active')
    }
  }
  var admin_signin = ()=>{
    if($("input:invalid").length === 0){
      var formData = {account: $("#admin_account").val(),passwd: $("#admin_passwd").val()}
      $.ajax({
        url: "/admin/valid",
        cache: false,
        type: 'POST',
        data: formData,
        beforeSend: ()=>{
          $("#gobackend").addClass('loading')
        },
        success: (html)=>{
          $("#main").addClass("fade-out")
          setTimeout(()=>{
            $("#main").removeClass("fade-out").html(html)
            add_msg_to_queue(2,"成功登入後臺(・∀・)")
            $(".step-item").removeClass('active')
            $(".step-item:nth-of-type(2)").addClass('active')
          },500)
          history.pushState(null,null,'/admin/select')
        },
        error: ()=>{
          error_bounce()
          add_msg_to_queue(3,"登入失敗，請檢查帳號密碼是否正確(・_・)")
          $("input").select()
        },
        complete: ()=>{
          $("#gobackend").removeClass("loading")
        }
      })
    }else{
      $("input:invalid")[0].focus()
    }
  }
  var send_vote = () =>{
    $.ajax({
      url: "/vote",
      cache: false,
      type: 'POST',
      data: {id: $("h3.title").data('id'),vote_targets: vote_targets},
      beforeSend: () =>{
        $("#voteit").addClass("loading")
      },
      success: (html)=>{
        $("#main").addClass("fade-out")
        setTimeout(()=>{
          $("#main").removeClass("fade-out").html(html)
          add_msg_to_queue(2,"投票成功，感謝您！(・∀・)")
          $(".step-item").removeClass('active')
          $('.step-item:nth-of-type(4)').addClass('active')
          timeup_check(html)
        },500)
      },
      statusCode: {
        422: ()=>{
          login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"發生不可預期之錯誤(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)")
        }
      },
      complete: () =>{
        $("#voteit").removeClass("loading")
      }
    })
  }
  // 前臺投票關鍵字過濾
  var order_status = ["unit","A"]
  var front_filter = (keyword) => {
    if($(".invisible").length > 0){
      $(".invisible").removeClass("invisible")
    } 
    if(keyword !== ""){
      let candidates = document.getElementsByClassName("candidate")
      for(let i=0;i<candidates.length;i++){
        if(!(candidates[i].children[0].innerText.includes(keyword) || candidates[i].children[1].innerText.includes(keyword) || candidates[i].children[2].innerText.includes(keyword))){
          candidates[i].classList.add("invisible")
        }
      }
    }
  }
  // 控制前臺投票的排序
  var front_order = (column) => {
    var cels = document.getElementsByClassName("candidate")
    var candidates = []
    for(let i = 0; i < cels.length; i++){
      candidates.push({
        element: cels[i],
        name: cels[i].children[0].innerText,
        unit: cels[i].children[1].innderText,
        title: cels[i].children[2].innerText
      })
    }
    // 如果點同一排序
    if(order_status[0] === column){
      if(order_status[1] === "A"){
        // 昇轉降
        order_status[1] = "D"
        var sorted = candidates.sort((a,b) => {
          return a[column] < b[column] ? 1 : -1
        })
      }else{
        // 降轉昇
        order_status[1] = "A"
        var sorted = candidates.sort((a,b) => {
          return a[column] > b[column] ? 1 : -1
        })
      }
      // 點不同排序
    }else{
      order_status[0] = column
      order_status[1] = "A"
      var sorted = candidates.sort((a,b) => {
        return a[column] > b[column] ? 1 : -1
      })
    }
    sorted.forEach((s) => {
      document.getElementsByClassName("table")[0].appendChild(s.element)
    })
    document.querySelector("th>i.icon").remove()
    switch(order_status[0]){
      case "name":
        var order_target = document.getElementsByTagName("th")[0]
      break
      case "unit":
        var order_target = document.getElementsByTagName("th")[1]
      break
      case "title":
        var order_target = document.getElementsByTagName("th")[2]
      break
    }
    var order_icon = document.createElement("I")
    if(order_status[1] === "A"){
      order_icon.classList.add("icon","icon-arrow-down")
    }else{
      order_icon.classList.add("icon","icon-arrow-up")
    }
    order_target.append(order_icon)
  }
  // 後臺新增投票人關鍵字過濾
  var added_voters_order_status = ["name","A"]
  var added_voters_filter = (keyword) => {
    if($(".invisible").length > 0){
      $(".invisible").removeClass("invisible")
    }
    if(keyword !== ""){
      let voters = document.getElementsByClassName("voter")
      for(let i=0;i<voters.length;i++){
        if(!(voters[i].children[0].innerText.includes(keyword) || voters[i].children[1].innerText.includes(keyword) || voters[i].children[2].innerText.includes(keyword))){
          voters[i].classList.add("invisible")
        }
      }
    }
  }
  // 控制後臺新增投票人的排序
  var added_voters_order = (column) => {
    var vels = document.getElementsByClassName("voter")
    var voters = []
    for(let i = 0; i < vels.length; i++){
      voters.push({
        element: vels[i],
        name: vels[i].children[0].innerText,
        card_id: vels[i].children[1].innerText,
        birthday: vels[i].children[2].innerText
      })
    }
    // 如果點同一排序
    if(added_voters_order_status[0] === column){
      if(added_voters_order_status[1] === "A"){
        // 昇轉降
        added_voters_order_status[1] = "D"
        var added_voters_sorted = voters.sort((a,b) => {
          return a[column] < b[column] ? 1 : -1
        })
      }else{
        // 降轉昇
        added_voters_order_status[1] = "A"
        var added_voters_sorted = voters.sort((a,b) => {
          return a[column] > b[column] ? 1 : -1
        })
      }
      // 點不同排序
    }else{
      added_voters_order_status[0] = column
      added_voters_order_status[1] = "A"
      var added_voters_sorted = voters.sort((a,b) => {
        return a[column] > b[column] ? 1 : -1
      })
    }
    added_voters_sorted.forEach((s) => {
      document.getElementsByClassName("table")[0].appendChild(s.element)
    })
    if($("th>i.icon").length > 0){
      document.querySelector("th>i.icon").remove()
    }
    switch(added_voters_order_status[0]){
      case "name":
        var order_target = document.getElementsByTagName("th")[0]
      break
      case "card_id":
        var order_target = document.getElementsByTagName("th")[1]
      break
      case "birthday":
        var order_target = document.getElementsByTagName("th")[2]
      break
    }
    var order_icon = document.createElement("I")
    if(added_voters_order_status[1] === "A"){
      order_icon.classList.add("icon","icon-arrow-down")
    }else{
      order_icon.classList.add("icon","icon-arrow-up")
    }
    order_target.append(order_icon)
  }
  //
  // 後臺新增候選人關鍵字過濾
  var added_candidates_order_status = ["unit","A"]
  var added_candidates_filter = (keyword) => {
    if($(".invisible").length > 0){
      $(".invisible").removeClass("invisible")
    }
    if(keyword !== ""){
      let added_candidates = document.getElementsByClassName("added-candidate")
      for(let i=0;i<added_candidates.length;i++){
        if(!(added_candidates[i].children[0].innerText.includes(keyword) || added_candidates[i].children[1].innerText.includes(keyword) || added_candidates[i].children[2].innerText.includes(keyword))){
          added_candidates[i].classList.add("invisible")
        }
      }
    }
  }
  // 控制後臺新增候選人的排序
  var added_candidates_order = (column) => {
    var acels = document.getElementsByClassName("added-candidate")
    var added_candidates = []
    for(let i = 0; i < acels.length; i++){
      added_candidates.push({
        element: acels[i],
        name: acels[i].children[0].innerText,
        unit: acels[i].children[1].innerText,
        title: acels[i].children[2].innerText
      })
    }
    // 如果點同一排序
    if(added_candidates_order_status[0] === column){
      if(added_candidates_order_status[1] === "A"){
        // 昇轉降
        added_candidates_order_status[1] = "D"
        var added_candidates_sorted = added_candidates.sort((a,b) => {
          return a[column] < b[column] ? 1 : -1
        })
      }else{
        // 降轉昇
        added_candidates_order_status[1] = "A"
        var added_candidates_sorted = added_candidates.sort((a,b) => {
          return a[column] > b[column] ? 1 : -1
        })
      }
      // 點不同排序
    }else{
      added_candidates_order_status[0] = column
      added_candidates_order_status[1] = "A"
      var added_candidates_sorted = added_candidates.sort((a,b) => {
        return a[column] > b[column] ? 1 : -1
      })
    }
    added_candidates_sorted.forEach((s) => {
      document.getElementsByClassName("table")[0].appendChild(s.element)
    })
    if($("th>i.icon").length > 0){
      document.querySelector("th>i.icon").remove()
    }
    switch(added_candidates_order_status[0]){
      case "name":
        var order_target = document.getElementsByTagName("th")[0]
      break
      case "unit":
        var order_target = document.getElementsByTagName("th")[1]
      break
      case "title":
        var order_target = document.getElementsByTagName("th")[2]
      break
    }
    var order_icon = document.createElement("I")
    if(added_candidates_order_status[1] === "A"){
      order_icon.classList.add("icon","icon-arrow-down")
    }else{
      order_icon.classList.add("icon","icon-arrow-up")
    }
    order_target.append(order_icon)
  }
  //
  var logout = () =>{
    $.ajax({
      url: 'logout',
      cache: false,
      type: 'POST',
      beforeSend: () =>{
        $("#logout").addClass("loading")
      },
      success: (html)=>{
        $("#main").addClass("fade-out")
        setTimeout(()=>{
          $(".step-item").removeClass('active')
          $(".step-item:nth-of-type(1)").addClass('active')
          timeup_check(html)
          $("#main").removeClass("fade-out").html(html)
          add_msg_to_queue(2,"你依依不捨的成功登出了(´；ω；｀)")
          $("input:invalid")[0].focus()
        },500)
      },
      statusCode: {
        422: ()=>{
          login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"發生不可預期之錯誤(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)")
        }
      },
      complete: () =>{
        $("#logout").removeClass("loading")
      }
    })
  }
  var send_event = ()=>{
    data = {
      'title':$("#title").val(),
      'notice':$("#notice-field").val(),
      'start': (parseInt($("#start-year").val())+1911).toString()+"-"+$("#start-mon").val()+"-"+$("#start-day").val()+"-"+$("#start-hour").val()+":"+$("#start-min").val(),
      'dead': (parseInt($("#end-year").val())+1911).toString()+"-"+$("#end-mon").val()+"-"+$("#end-day").val()+"-"+$("#end-hour").val()+":"+$("#end-min").val(),
      'amount':$("#amount").val(),
      'people': ''
    }
    $.ajax({
      url: '/admin/events/create_event',
      data: {'event': data},
      dataType:'json' ,
      type: 'POST',
      beforeSend:()=>{
        $("#add-voter").addClass("loading")
      },
      success: (res)=>{
        $.ajax({
          url: '/admin/events/new_voter',
          type: 'GET',
          success: (html)=>{
            data = {
              'evid': res.id
            }
            $("#main").addClass('fade-out')
            setTimeout(()=>{
              $("#main").html(html).removeClass('fade-out')
              $(".step-item.active").removeClass('active')
              $(".step-item:nth-of-type(3").addClass('active')
            },500)
          }
        })
      },
      statusCode: {
        422: ()=>{
          admin_login_again_plz()
        },
        500: ()=>{
          error_bounce()
          $("#add-voter").removeClass("loading")
          add_msg_to_queue(3,"請確認填寫內容是否有誤(・_・)")
        }
      }
    })
  }
  var send_voter = ()=>{
    $.ajax({
      url: '/admin/events/'+data.evid+'/new_candidate',
      type: 'GET',
      success: (html)=>{
        $("#main").addClass("fade-out")
        setTimeout(()=>{
          $("#main").html(html)
          $(".step-item.active").removeClass('active')
          $(".step-item:nth-of-type(4)").addClass('active')
          $("#main").removeClass("fade-out")
        },500)
      },
      statusCode: {
        422: ()=>{
          admin_login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"發生不可預期之錯誤(・_・)")
        }
      }
    })
  }
  var create_voter = ()=>{
    $.ajax({
      url: '/admin/events/create_voter',
      type: 'POST',
      data: {evid: data.evid, name: $("#voter-name").val(), card: $("#voter-card").val(), birthday: $("#voter-birth").val()},
      beforeSend: ()=>{
        $(".create-new-voter").addClass('loading')
      },
      success: (html)=>{
        add_msg_to_queue(2,"成功新增投票人")
        $("#new-voter-fields").removeClass('active')
        $("#new-voter-fields>input[type='text']").val('')
        $("#voter-list").html(html)
      },
      statusCode: {
        422: ()=>{
          admin_login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"聽話，不要亂打(ノ｀Д´)ノ彡┻━┻")
        }
      },
      complete: ()=>{
        $(".create-new-voter").removeClass('loading')
      }
    })
  }
  var click_count = 0
  $(document).on('click',(e)=>{
    click_count++
    if(click_count % 33 == 0 || click_count % 57 == 0){
      dont_give_me_that_face(e.pageY-84)
      if(click_count >= 1000){
        click_count = 0
      }
    }
  })
  $(document).on('click','#testing',()=>{
    $.ajax({
      url: 'event/22',
      type: 'GET',
      success: (html)=>{
        $("#main").html(html)
      },
    })
  })
  $("a.tooltip").on('click',(e)=>{
    e.preventDefault()
  })
  $("h1.title").on("contextmenu",(e)=>{
    e.preventDefault()
  })
  $("h1.title").on("mousedown",(e)=>{
    if(e.which == 3){
      $("h1.title").addClass("something-happen")
      final_countdown = setTimeout(()=>{
        if(window.location.pathname.includes('admin')){
          window.location = "/"
        }else{
          window.location = '/admin'
        }
      },1000)
    }
  })
  $(document).on("mouseup",()=>{
    if(typeof(final_countdown)!== 'undefined'){
      clearTimeout(final_countdown)
    }
    $("h1.title").removeClass("something-happen")
  })
  $(document).on('click','#logout',()=>{
    logout()
  })
  $(document).on('click','#ok_mom_i_will',()=>{
    $("#notice").addClass("fade-out")
    setTimeout(()=>{
      $("#notice").remove()
    },500)
  })
  $(document).on('keydown','body,#account,#passwd',(e)=>{
    e.stopPropagation()
    if(window.location.pathname === '/'){ //如果是在root頁面
      if(e.target == $("body")[0]){ 
        if(e.keyCode === 13){
          voter_signin()
        }else{
          if($("input:invalid").length > 0){
            $("input:invalid")[0].focus()
          }
        }
      }else if((e.target === $("#account")[0] || e.target === $("#passwd")[0]) && (e.keyCode === 13)){
        voter_signin()
      }
    }
  })
  $(document).on('keydown','body,#admin_account,#admin_passwd',(e)=>{
    e.stopPropagation()
    if(window.location.pathname === ('/admin')){ //僅限後端登入畫面
      if(e.target == $("body")[0]){
        if(e.keyCode === 13){
          admin_signin()
        }else{
          $("input:invalid")[0].focus()
        }
      }else if((e.target === $("#admin_account")[0] || e.target === $("#admin_passwd")[0]) && (e.keyCode === 13)){
        admin_signin()
      }
    }
  })
  $(document).on('click','#vote-module',()=>{
    $("#vote-module").addClass("changing")
    setTimeout(()=>{
      $("#vote-module").removeClass("changing")
    },200)
    setTimeout(()=>{
      window.location = '/admin/events'
    },400)
  })
  $(document).on('click','#admin-out',()=>{
    $.ajax({
      url: '/admin/logout',
      type: 'GET',
      beforeSend: ()=>{
        $("#admin-out").addClass("loading")
      },
      success: (html)=>{
        $("#main").addClass("fade-out")
        setTimeout(()=>{
          $("#main").html(html).removeClass("fade-out")
          add_msg_to_queue(2,"成功登出後臺(´・ω・｀)")
          $(".step-item.active").removeClass("active")
          $(".step-item:first-of-type").addClass("active")
          history.pushState(null,null,"/admin")
        },500)
      },
      error: ()=>{
        $("#admin-out.loading").removeClass("loading")
        add_msg_to_queue(3,"發生不可預期之錯誤(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)")
      }
    })
  })
  $(document).on('click','#to-sysrc',()=>{
    window.location = "/admin/sysrc"
  })
  $(document).on('click','#permission-module',()=>{
    $("#permission-module").addClass("changing")
    setTimeout(()=>{
      $("#permission-module").removeClass("changing")
    },200)
    setTimeout(()=>{
      window.location = '/admin/permissions'
    },400)
  })
  $(document).on('click','.add-admin',()=>{
    $("#adminlist-zone").addClass('active')
    $("#account-field").focus()
  })
  $(document).on('click','.cancel-admin',()=>{
    $("#adminlist-zone").removeClass('active')
    $("#account-field,#passwd-field").val('')
  })
  $(document).on('click','.save-admin',()=>{
    $.ajax({
      url: '/admin/create_admin',
      type: 'POST',
      data: {account: $("#account-field").val(), passwd: $("#passwd-field").val()},
      beforeSend: ()=>{
        $(".save-admin").addClass("loading")
      },
      success: (html)=>{
        $("#adminlist").html(html)
        add_msg_to_queue(2,"後臺帳號新增成功(・∀・)")
      },
      statusCode: {
        422: ()=>{
          admin_login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"發生不可預期之錯誤(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)")
        }
      },
      complete: ()=>{
        $(".save-admin").removeClass("loading")
      }
    })
  })
  $(document).on('click','.del-admin',(e)=>{
    if(e.target.tagName === 'I'){
      var btn = e.target.parentNode
    }else{
      var btn = e.target
    }
    var el = btn.parentNode
    var adid = btn.dataset.admin
    $.ajax({
      url: '/admin/admin/del/'+adid,
      type: 'GET',
      beforeSend: ()=>{
        btn.classList.add('loading')
      },
      success: ()=>{
        el.remove()
        add_msg_to_queue(2,"管理者帳號已順利刪除(´・ω・｀)")
      },
      statusCode: {
        422: ()=>{
          btn.classList.remove('loading')
          admin_login_again_plz()
        },
        500: ()=>{
          btn.classList.remove('loading')
          add_msg_to_queue(3,"發生不可預期之錯誤(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)")
        },
        423: () =>{
          btn.classList.remove('loading')
          add_msg_to_queue(3,"不可以移除你自己哦,再給自己一次機會(´・ω・｀)")
        }
      }
    })
  })
  $(document).on('click','#to-menu',()=>{
    window.location = '/admin/select'
  })
  var event_data = new FormData
  $(document).on('click','#add-event',()=>{
    $.ajax({
      url: '/admin/events/new_event',
      type: 'GET',
      success: (html)=>{
        $("#main").addClass("fade-out")
        new_event_data = new FormData
        setTimeout(()=>{
          $("#main").html(html)
          $(".step-item.active").removeClass('active')
          $(".step-item:nth-of-type(2)").addClass('active')
          $("#main").removeClass("fade-out")
          $("#title").focus()
        },500)
      }
    })
  })
  $(document).on('click','#quit-event',()=>{
    $.ajax({
      url: '/admin/event/del/'+data.evid,
      type: 'GET',
      beforeSend: ()=>{
        $("#quit-event").addClass('loading')
      },
      success: ()=>{
        $.ajax({
          url: '/admin/events',
          type: 'GET',
          success: (html)=>{
            $("#main").addClass('fade-out')
            setTimeout(()=>{
              $("#main").html(html).removeClass('fade-out')
              $(".step-item.active").removeClass('active')
              $(".step-item:nth-of-type(1)").addClass('active')
            },500)
          }
        })
      },
      statusCode: {
        422: ()=>{
          admin_login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"發生無法預期的錯誤(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)")
        }
      },
      complete: ()=>{
        $("#quit-event").removeClass('loading')
      }
    })
  })
  $(document).on('click','#add-voter',()=>{
    if($("#event-zone input:invalid").length === 0){
      send_event()
    }else{
      add_msg_to_queue(3,"雖然我書讀的少,但我知道你還有未填的欄位唷...(´・ω・｀)")
    }
  })
  $(document).on('input','#add-voter-filter',(e) => {
    added_voters_filter(e.target.value)
  })
  $(document).on('keypress','#event-zone input',(e)=>{
    if(e.keyCode === 13){
      if($("#event-zone input:invalid").length === 0){
        send_event()
      }else{
        add_msg_to_queue(3,"學(長/姐),還有未填的欄位唷...(´・ω・｀)")
      }
    }
  })
  $(document).on('click','#new-voter',()=>{
    $("#new-voter-fields").addClass('active')
    $(".add-another-voter:first-of-type").focus()
  })
  $(document).on('click','.create-new-voter',()=>{
    if($("#new-voter-fields input:invalid").length > 0){
      add_msg_to_queue(3,"你好像少寫了什麼(´・ω・｀)")
    }else{
      create_voter()
    }
  })
  $(document).on('click','.cancel-new-voter',()=>{
    $("#new-voter-fields").removeClass('active')
    $("#new-voter-fields>input[type='text']").val('')
  })
  $(document).on('click','#add-candidate',()=>{
    console.log($("#voter-list tr.voter"))
    if($("#voter-list tr.voter").length > 0){
      send_voter()
    }else{
      error_bounce()
      add_msg_to_queue(3,"沒有投票人是要自由心證逆ヽ(｀Д´#)")
    }
  })
  $(document).on('keypress','#new-voter-fields input',(e)=>{
    if(e.keyCode === 13){
      if($("#new-voter-fields input:invalid").length > 0){
        add_msg_to_queue(3,"你好像少寫了什麼(´・ω・｀)")
      }else{
        create_voter()
      }
    }
  })
  $(document).on('click','.del-candidate',(e)=>{
    e.stopPropagation()
    if(e.target.tagName === 'I'){
      var target_candidate = e.target.parentNode.parentNode.parentNode
      var target_btn = e.target.parentNode
      var cid = target_btn.dataset.candidate
    }else{
      var target_candidate = e.target.parentNode.parentNode
      var target_btn = e.target
      var cid = target_btn.dataset.candidate
    }
    $.ajax({
      url: '/admin/candidate/del/'+cid,
      type: 'GET',
      beforeSend: ()=>{
        target_btn.classList.add('loading')
      },
      success: ()=>{
        target_candidate.remove()
          add_msg_to_queue(2,"候選人已刪除( ｀・∀・´ )！")
      },
      statusCode: {
        422: ()=>{
          admin_login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"發生無法預期之錯誤(・_・)！")
          target_btn.classList.remove('loading')
        }
      }
    })
  })
  $(document).on('click','.vote',(e)=>{
    $.ajax({
      url: '/signin/'+e.target.dataset.evid,
      type: 'GET',
      success: (html) =>{
        $("#main").addClass("fade-out")
        setTimeout(()=>{
          $("#main").html(html).removeClass("fade-out")
          $(".step-item.active").removeClass("active")
          $(".step-item:nth-of-type(2)").addClass("active")
        },500)
      }
    })
  })
  $(document).on('click','#back-to-entrance',()=>{
    $.ajax({
      url: '/',
      type: 'GET',
      success: (html)=>{
        $("#main").addClass("fade-out")
        setTimeout(()=>{
          $("#main").html(html).removeClass("fade-out")
          $(".step-item.active").removeClass("active")
          $(".step-item:first-of-type").addClass("active")
        },500)
      }
    })
  })
  $(document).on('click','#import-voter',()=>{
    $("#import-file").click()
  })
  $(document).on('click','#import-candidate',()=>{
    $("#import-file-c").click()
  })
  $(document).on('change',"#import-file",()=>{
    var file = $("#import-file")[0].files[0]
    if(file.type.includes("text")){
      var reader = new FileReader
      reader.onload = ()=>{
        var people = reader.result.split(/\r\n|\n/)
        people.pop()
        data.people=people.reverse().join(';')
        $.ajax({
          url: '/admin/events/import_voter',
          type: 'POST',
          data: data,
          beforeSend:()=>{
            $("#import-voter").addClass('loading')
            $("#add-candidate").addClass('disabled')
          },
          success: (html)=>{
            $("#voter-list").html(html)
          },
          statusCode: {
            422: ()=>{
              admin_login_again_plz()
            },
            500: ()=>{
              add_msg_to_queue(3,"學長，發生意料之外的錯誤了(・_・)")
            }
          },
          complete: ()=>{
            $("#import-voter").removeClass('loading')
            $("#add-candidate").removeClass('disabled')
          }
        })
      }
      reader.readAsText(file)
    }else{
      add_msg_to_queue(3,"檔案格式不正確，匯入僅支援使用TXT純文字檔案(´・ω・｀)")
    }
  })
  $(document).on('change',"#import-file-c",()=>{
    var file = $("#import-file-c")[0].files[0]
    if(file.type.includes("text")){
      var reader = new FileReader
      reader.onload = ()=>{
        var people = reader.result.split(/\r\n|\n/)
        people.pop()
        data.people=people.reverse().join(';')
        $.ajax({
          url: '/admin/events/import_candidate',
          type: 'POST',
          data: data,
          beforeSend:()=>{
            $("#import-candidate").addClass('loading')
            $("#finish-event").addClass("disabled")
          },
          success: (html)=>{
            $("#candidate-list").html(html)
          },
          statusCode: {
            422: ()=>{
              admin_login_again_plz()
            },
            500: ()=>{
              add_msg_to_queue(3,"發生無法預期的錯誤(・_・)!")
            }
          },
          complete: ()=>{
            $("#import-candidate").removeClass('loading')
            $("#finish-event").removeClass("disabled")
          }
        })
      }
      reader.readAsText(file)
    }else{
      add_msg_to_queue(3,"檔案格式不正確，匯入僅支援使用TXT純文字檔案(´・ω・｀)")
    }
  })


  $(document).on('click','#create-candidate',()=>{
    if($("#new-candidate-form input:invalid").length > 0){
      add_msg_to_queue(3,"候選人的資訊好像少了點什麼(・_・)")
    }else{
      $.ajax({
        url: '/admin/events/create_candidate',
        type: 'POST',
        data: {evid: data.evid, name: $("input#name").val(), unit: $("input#unit").val(), title: $("input#title").val()},
        beforeSend: ()=>{
          $("#create-candidate").addClass('loading')
        },
        success: (html)=>{
          $("#candidate-list").html(html)
          add_msg_to_queue(2,"成功新增候選人")
        },
        statusCode: {
          422: ()=>{
            admin_login_again_plz()
          },
          500: ()=>{
            add_msg_to_queue(3,"發生不可預期之錯誤(・_・)!")
          }
        },
        complete: ()=>{
          $("#create-candidate").removeClass('loading')
        }
      })
    }
  })
  $(document).on('click','#finish-event',()=>{
    if($("#candidate-list .added-candidate").length > 0){
      $.ajax({
        url: '/admin/events',
        type: 'GET',
        success: (html)=>{
          $("#main").addClass("fade-out")
          setTimeout(()=>{
            $("#main").html(html)
            $(".step-item.active").removeClass('active')
            $(".step-item:nth-of-type(1)").addClass('active')
            $("#main").removeClass("fade-out")
          },500)
        }
      })
    }else{
      error_bounce()
      add_msg_to_queue(3,"候選人至少一個please！(・∀・)")
    }
  })
  $(document).on('click','#cancel-event',()=>{
    $.ajax({
      url: '/admin/events',
      type: 'GET',
      success: (html)=>{
        $("#main").addClass("fade-out")
        setTimeout(()=>{
          $("#main").html(html)
          $(".step-item.active").removeClass('active')
          $(".step-item:nth-of-type(1)").addClass('active')
          $("#main").removeClass("fade-out")
        },500)
      },
      statusCode: {
        422: ()=>{
          admin_login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"發生無法預期的錯誤(・_・)!")
        }
      }
    })
  })
  $(document).on('click','.del-voter',(e)=>{
    if(e.target.tagName === 'I'){
      var target_voter = e.target.parentNode
    }else{
      var target_voter = e.target
    }
    $.ajax({
      url: '/admin/voter/del/'+target_voter.dataset.voter,
      type: 'GET',
      beforeSend: ()=>{
        target_voter.classList.add('loading')
      },
      success: ()=>{
        target_voter.parentNode.parentNode.remove()
        add_msg_to_queue(2,"投票人成功移除！(・∀・)")
      },
      error: ()=>{
        target_voter.classList.remove('loading')
      }
    })
  })
  $(document).on('click','.delete',(e)=>{
    e.stopPropagation()
    if(e.target.tagName === 'I'){
      var title = e.target.parentNode.dataset.title
      var startline = e.target.parentNode.dataset.startline
      var deadline = e.target.parentNode.dataset.deadline
      var tid = e.target.parentNode.dataset.tid
    }else{
      var title = e.target.dataset.title
      var startline = e.target.dataset.startline
      var deadline = e.target.dataset.deadline
      var tid = e.target.dataset.tid
    }
    $(".del-title").text(title)
    $(".del-startline").text(startline)
    $(".del-deadline").text(deadline)
    $(".statistic").removeClass('active')
    $(".alert-box").addClass('active')
    $(".target-info").attr('data-tid',tid)
  })
  $(document).on('click','.del-yes',(e)=>{
    var tid = $('.target-info')[0].dataset.tid
    $.ajax({
      url: '/admin/event/del/'+tid,
      type: 'GET',
      beforeSend: ()=>{
        $(".del-yes").addClass('loading')
      },
      success: ()=>{
        $(".delete[data-tid="+$('.target-info')[0].dataset.tid+"]")[0].parentNode.remove()
        add_msg_to_queue(2,"投票已順利刪除(´・ω・｀)")
        $(".alert-box").removeClass('active')
      },
      statusCode:{
        422: ()=>{
          admin_login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"發生不可預期之錯誤(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)")
        }
      },
      complete: ()=>{
        $(".del-yes").removeClass('loading')
      }
    })
  })
  $(document).on('click','.edit-event',(e)=>{
    if(e.target.tagName === "BUTTON"){
      var edit_evid = e.target.children[0].dataset.evid
      var edit_btn = e.target
    }else{
      var edit_evid = e.target.dataset.evid
      var edit_btn = e.target.parentNode
    }
    $.ajax({
      url: "/admin/edit_info/"+edit_evid,
      type: "GET",
      beforeSend: ()=>{
        edit_btn.classList.add("loading")
      },
      success: (html)=>{
        $(".edit-box").html(html).addClass("active")
      },
      statusCode: {
        500: ()=>{
          add_msg_to_queue(3,"發生不可預期的錯誤 (´・ω・｀)")
        },
        422: ()=>{
          admin_login_again_plz()
        }
      },
      complete: ()=>{
        edit_btn.classList.remove("loading")
      }
    })
  })
  $(document).on('click','.edit-event-title',(e)=>{
    e.preventDefault()
    e.stopPropagation()
    if($(".edit #title").attr("disabled") === "disabled"){
      $(".edit #title").attr("disabled",false)
      origin_event_title = $(".edit #title").val()
    }else{
      $(".edit #title").attr("disabled",true)
    }
    if(e.target.tagName === "BUTTON"){
      e.target.children[0].classList.toggle("icon-edit")
      e.target.children[0].classList.toggle("icon-check")
      var edit_evid = e.target.children[0].dataset.evid
    }else{
      e.target.classList.toggle("icon-edit")
      e.target.classList.toggle("icon-check")
      var edit_evid = e.target.dataset.evid
    }
    if(origin_event_title !== $(".edit #title").val()){
      $.ajax({
        url: "/admin/update_info/"+edit_evid,
        type: "PATCH",
        data: {title: $(".edit #title").val()},
        success: ()=>{
          add_msg_to_queue(2,"投票資訊已經更新(・∀・)")
          $("h3.event-title[data-evid="+edit_evid+"]").text($(".edit #title").val())
          $(".edit-box h2").text("編輯「"+$(".edit #title").val()+"」的投票資訊")
        },
        statusCode: {
          500: ()=>{
            add_msg_to_queue(3,"發生不可預期的錯誤(´・ω・｀)")
          },
          422: ()=>{
            admin_login_again_plz()
          }
        }
      })
    }
  })
  $(document).on('click','.edit-event-notice',(e)=>{
    e.preventDefault()
    e.stopPropagation()
    if($(".edit #notice-field").attr("disabled") === "disabled"){
      $(".edit #notice-field").attr("disabled",false)
      origin_event_notice = $(".edit #notice-field").val()
    }else{
      $(".edit #notice-field").attr("disabled",true)
    }
    if(e.target.tagName === "BUTTON"){
      e.target.children[0].classList.toggle("icon-edit")
      e.target.children[0].classList.toggle("icon-check")
      var edit_evid = e.target.children[0].dataset.evid
    }else{
      e.target.classList.toggle("icon-edit")
      e.target.classList.toggle("icon-check")
      var edit_evid = e.target.dataset.evid
    }
    if(origin_event_notice !== $(".edit #notice-field").val()){
      $.ajax({
        url: "/admin/update_info/"+edit_evid,
        type: "PATCH",
        data: {notice: $(".edit #notice-field").val()},
        success: ()=>{
          $("h3.event-title[data-evid="+edit_evid+"]").attr("title",$(".edit #notice-field").val())
          add_msg_to_queue(2,"投票資訊已經更新(・∀・)")
        },
        statusCode: {
          500: ()=>{
            add_msg_to_queue(3,"發生不可預期的錯誤(´・ω・｀)")
          },
          422: ()=>{
            admin_login_again_plz()
          }
        }
      })
    }
  })
  $(document).on('click','.edit-event-amount',(e)=>{
    e.preventDefault()
    e.stopPropagation()
    if($(".edit #amount").attr("disabled") === "disabled"){
      $(".edit #amount").attr("disabled",false)
      origin_event_amount = $(".edit #amount").val()
    }else{
      $(".edit #amount").attr("disabled",true)
    }
    if(e.target.tagName === "BUTTON"){
      e.target.children[0].classList.toggle("icon-edit")
      e.target.children[0].classList.toggle("icon-check")
      var edit_evid = e.target.children[0].dataset.evid
    }else{
      e.target.classList.toggle("icon-edit")
      e.target.classList.toggle("icon-check")
      var edit_evid = e.target.children[0].dataset.evid
    }
    if(origin_event_amount !== $(".edit #amount").val()){
      $.ajax({
        url: "/admin/update_info/"+edit_evid,
        type: "PATCH",
        data: {amount: $(".edit #amount").val()},
        success: ()=>{
          add_msg_to_queue(2,"投票資訊已經更新(・∀・)")
        },
        statusCode: {
          500: ()=>{
            add_msg_to_queue(3,"發生不可預期的錯誤(´・ω・｀)")
          },
          422: ()=>{
            admin_login_again_plz()
          }
        }
      })
    }
  })
  $(document).on('click','.edit-event-start',(e)=>{
    e.preventDefault()
    e.stopPropagation()
    if($(".edit input.edit-start").attr("disabled") === "disabled"){
      $(".edit input.edit-start").attr("disabled",false)
      oels = $(".edit input.edit-start")
      oyear = oels[0].value
      omon = oels[1].value
      oday = oels[2].value
      ohour = oels[3].value
      omin = oels[4].value
      origin_event_start = (parseInt(oyear)+1911).toString()+"-"+omon+"-"+oday+"-"+ohour+":"+omin
    }else{
      $(".edit input.edit-start").attr("disabled",true)
    }
    if(e.target.tagName === "BUTTON"){
      e.target.children[0].classList.toggle("icon-edit")
      e.target.children[0].classList.toggle("icon-check")
      var edit_evid = e.target.children[0].dataset.evid
    }else{
      e.target.classList.toggle("icon-edit")
      e.target.classList.toggle("icon-check")
      var edit_evid = e.target.dataset.evid
    }
    els = $(".edit input.edit-start")
    var time_str = (parseInt(els[0].value)+1911).toString()+"-"+els[1].value+"-"+els[2].value+"-"+els[3].value+":"+els[4].value
    if(origin_event_start !== time_str){
      $.ajax({
        url: "/admin/update_info/"+edit_evid,
        type: "PATCH",
        data: {start: time_str},
        success: ()=>{
          add_msg_to_queue(2,"投票資訊已經更新(・∀・)")
        },
        statusCode: {
          500: ()=>{
            add_msg_to_queue(3,"發生不可預期的錯誤(´・ω・｀)")
            $("#start-year").val(oyear)
            $("#start-mon").val(omon)
            $("#start-day").val(oday)
            $("#start-hour").val(ohour)
            $("#start-min").val(oday)
          },
          422: ()=>{
            admin_login_again_plz()
          }
        }
      })
    }
  })
  $(document).on('click','.edit-event-end',(e)=>{
    e.preventDefault()
    e.stopPropagation()
    if($(".edit input.edit-end").attr("disabled") === "disabled"){
      $(".edit input.edit-end").attr("disabled",false)
      oels = $(".edit input.edit-end")
      oyear = oels[0].value
      omon = oels[1].value
      oday = oels[2].value
      ohour = oels[3].value
      omin = oels[4].value
      origin_event_end = (parseInt(oyear)+1911).toString()+"-"+omon+"-"+oday+"-"+ohour+":"+omin
    }else{
      $(".edit input.edit-end").attr("disabled",true)
    }
    if(e.target.tagName === "BUTTON"){
      e.target.children[0].classList.toggle("icon-edit")
      e.target.children[0].classList.toggle("icon-check")
      var edit_evid = e.target.children[0].dataset.evid
    }else{
      e.target.classList.toggle("icon-edit")
      e.target.classList.toggle("icon-check")
      var edit_evid = e.target.dataset.evid
    }
    els = $(".edit input.edit-end")
    var time_str = (parseInt(els[0].value)+1911).toString()+"-"+els[1].value+"-"+els[2].value+"-"+els[3].value+":"+els[4].value
    if(origin_event_end !== time_str){
      $.ajax({
        url: "/admin/update_info/"+edit_evid,
        type: "PATCH",
        data: {dead: time_str},
        success: ()=>{
          add_msg_to_queue(2,"投票資訊已經更新(・∀・)")
        },
        statusCode: {
          500: ()=>{
            add_msg_to_queue(3,"發生不可預期的錯誤(´・ω・｀)")
            $("#end-year").val(oyear)
            $("#end-mon").val(omon)
            $("#end-day").val(oday)
            $("#end-hour").val(ohour)
            $("#end-min").val(oday)
          },
          422: ()=>{
            admin_login_again_plz()
          }
        }
      })
    }
  })
  $(document).on('click','.update-event,.update-voter,.update-candidate',(e)=>{
    e.preventDefault()
    e.stopPropagation()
    $(".edit-box").removeClass("active")
    setTimeout(()=>{
      $(".edit-box").html("")
    },500)
  })
  $(document).on('click','.edit-voter',(e)=>{
    if(e.target.tagName === "BUTTON"){
      var edit_evid = e.target.children[0].dataset.evid
      var edit_btn = e.target
    }else{
      var edit_evid = e.target.dataset.evid
      var edit_btn = e.target.parentNode
    }
    $.ajax({
      url: "/admin/edit_voters/"+edit_evid,
      type: "GET",
      beforeSend: ()=>{
        edit_btn.classList.add("loading")
      },
      success: (html)=>{
        $(".edit-box").html(html).addClass("active")
        edit_voter_evid = edit_evid
      },
      complete: ()=>{
        edit_btn.classList.remove("loading")
      }
    })
  })
  $(document).on('click','.edit-create-new-voter',()=>{
    if($("#edit-voter-name:invalid,#edit-voter-card:invalid,#edit-voter-birth:invalid").length === 0){
      $.ajax({
        url: "/admin/events/create_voter",
        type: "POST",
        data: {name: $("#edit-voter-name").val(), card: $("#edit-voter-card").val(), birthday: $("#edit-voter-birth").val(), evid: edit_voter_evid},
        success: ()=>{
          $.ajax({
            url: "/admin/edit_voters/"+edit_voter_evid,
            type: "GET",
            success: (html)=>{
              $(".edit-box").html(html)
            }
          })
          add_msg_to_queue(2,"投票人新增成功!(・∀・)")
        },
        statusCode: {
          500: ()=>{
            add_msg_to_queue(3,"不要亂打(・_・)")
            error_bounce()
          },
          422: ()=>{
            admin_login_again_plz()
          }
        }
      })
    }else{
      add_msg_to_queue(3,"投票人資訊有缺！(・_・)")
      error_bounce()
    }
  })
  $(document).on('click','.edit-candidate',(e)=>{
    if(e.target.tagName === "BUTTON"){
      var edit_evid = e.target.children[0].dataset.evid
      var edit_btn = e.target
    }else{
      var edit_evid = e.target.dataset.evid
      var edit_btn = e.target.parentNode
    }
    $.ajax({
      url: "/admin/edit_candidates/"+edit_evid,
      type: "GET",
      beforeSend: ()=>{
        edit_btn.classList.add("loading")
      },
      success: (html)=>{
        $(".edit-box").html(html).addClass("active")
        edit_candidate_evid = edit_evid
      },
      statusCode: {
        500: ()=>{
          add_msg_to_queue(3,"發生不可預期的錯誤(´・ω・｀)")
        },
        422: ()=>{
          admin_login_again_plz()
        }
      },
      complete: ()=>{
        edit_btn.classList.remove("loading")
      }
    })
  })
  $(document).on('click','#edit-create-candidate',()=>{
    if($("#edit-name:invalid,#edit-unit:invalid,#edit-title:invalid").length === 0){
      $.ajax({
        url: "/admin/events/create_candidate",
        type: "POST",
        data: {name: $("#edit-name").val(),unit: $("#edit-unit").val(),title: $("#edit-title").val(),evid: edit_candidate_evid},
        success: (html)=>{
          $.ajax({
            url: "/admin/edit_candidates/"+edit_candidate_evid,
            type: "GET",
            success: (html)=>{
              $(".edit-box").html(html)
            }
          })
          add_msg_to_queue(2,"候選人新增成功！(・∀・)")
        },
        statusCode: {
          500: ()=>{
            add_msg_to_queue(3,"不要亂打！(・_・)")
            error_bounce()
          },
          422: ()=>{
            admin_login_again_plz()
          }
        }
      })
    }else{
      add_msg_to_queue(3,"候選人資訊有缺!(・_・)")
      error_bounce()
    }
  })
  $(document).on('click','.votecount',(e)=>{
    if(e.target.tagName === 'I'){
      tid = e.target.parentNode.dataset.tid
    }else{
      tid = e.target.dataset.tid
    }
    $.ajax({
      url: '/admin/event/'+tid,
      type: 'GET',
      beforeSend: ()=>{
        e.target.classList.add('loading')
      },
      success: (html)=>{
        $(".statistic>.content").html(html)
        $(".alert-box").removeClass('active')
        $(".statistic").addClass('active')
      },
      statusCode: {
        422: ()=>{
          admin_login_again_plz()
        },
        500: ()=>{
          add_msg_to_queue(3,"發生不可預期之錯誤(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)")
        }
      },
      complete: ()=>{
        e.target.classList.remove('loading')
      }
    })
  })
  $(document).on('click','.del-no',(e)=>{
    $(".alert-box").removeClass('active')
  })
  $(document).on('click','button.ok',(e)=>{
    e.target.parentNode.classList.remove('active')
  })
  $(document).on('click','#govote',(e)=>{
    voter_signin()
  })
  $(document).on('click','#gobackend',(e)=>{
    admin_signin()
  })
  var choose_target = (target, vote_targets) =>{
    var cid = target.dataset.cid
    if(vote_targets.indexOf(cid) == -1){ //列表找不到就新增
      if(vote_targets.length < limit){
        vote_targets.push(cid)
        target.classList.toggle('chosen')
        current_count++
        num2word(limit-current_count)
      }
    }else{ // 列表找到了就做刪除
      vote_targets.splice(vote_targets.indexOf(cid),1)
      target.classList.toggle('chosen')
      current_count--
      num2word(limit-current_count)
    }
    if($(".chosen").length > 0){
      $("#voteit").removeClass("disabled")
    }else{
      $("#voteit").addClass("disabled")
    }
  }
  var num2word = (num)=>{
    switch(num){
      case 0:
        var word = '零'
        break
      case 1:
        var word = '一'
        break
      case 2:
        var word = '二'
        break
      case 3:
        var word = '三'
        break
      case 4:
        var word = '四'
        break
      case 5:
        var word = '五'
        break
      case 6:
        var word = '六'
        break
      case 7:
        var word = '七'
        break
      case 8:
        var word = '八'
        break
      case 9:
        var word = '九'
        break
      case 10:
        var word = '十'
        break
    }
    $("#limit_hint>mark").text(word)
  }
  $(document).on('click','.candidates,.candidates use',(e)=>{
    if(e.target.tagName.toLowerCase() === "td"){
      var candidate = e.target.parentNode
      choose_target(candidate, vote_targets)
    }else if(e.target.tagName.toLowerCase() === "use"){
      e.stopPropagation()
      var candidate = e.target.parentNode.parentNode.parentNode
      choose_target(candidate, vote_targets)
    }
  })
  $(document).on('input','#search-voter',(e)=>{
    var options = $("option")
    for(let i=1;i<options.length;i++){
      if(options[i].value.includes(e.target.value)){
        options[i].removeAttribute('hidden')
      }else{
        options[i].setAttribute('hidden',true)
      }
    }
    $("select")[0].selectedIndex=0
    $("#name.form-select").addClass("changing")
    setTimeout(()=>{
      $(".changing").removeClass("changing")
    },250)
  })
  $(document).on('click','#voteit',()=>{
    send_vote()
  })
  $(document).on('input','#candidate-filter',(e) => {
    front_filter(e.target.value)
  })
  $(document).on('input','#add-candidate-filter',(e) => {
    added_candidates_filter(e.target.value)
  })
  $(document).on('click','.table th.sort-candidates',(e) => {
    switch(e.target.innerText){
      case "姓名":
        front_order('name')
      break
      case "組室":
        front_order('unit')
      break
      case "職稱":
        front_order('title')
      break
    }
  })
  //
  $(document).on('click','.table th.sort-added-voters',(e) => {
    switch(e.target.innerText){
      case "姓名":
        added_voters_order('name')
      break
      case "身份證":
        added_voters_order('card_id')
      break
      case "生日":
        added_voters_order('birthday')
      break
    }
  })
  //
  $(document).on('click','.table th.sort-added-candidates',(e) => {
    switch(e.target.innerText){
      case "姓名":
        added_candidates_order('name')
      break
      case "單位":
        added_candidates_order('unit')
      break
      case "職稱":
        added_candidates_order('title')
      break
    }
  })
})
