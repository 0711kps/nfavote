Rails.application.routes.draw do
  root to: 'votes#entrance'
  get 'signin/:id' => 'votes#signin_form'
  post "valid" => "votes#validate"
  get "candidates/:id" => "votes#candidates"
  post "vote" => "votes#vote"
  post "logout" => "votes#logout"
  get "thx/:id" => "votes#thx"
  get "no_event" => "votes#no_event"
  namespace :admin do
    root to: 'votes#entrance'
    get 'sysrc' => 'votes#sysrc_monitor'
    get 'download_log/:log_id' => 'votes#download_log', as: "download_log"
    get 'select' => 'votes#select'
    post 'valid' => 'votes#valid'
    get 'events' => 'events#event_list'
    get 'events/new_event' => 'events#new_event'
    post 'events/create_event' => 'events#create_event'
    get 'events/new_voter' => 'events#new_voter'
    post 'events/create_voter' => 'events#create_voter'
    post 'events/import_voter' => 'events#import_voter'
    get 'voter/del/:id' => 'events#del_voter'
    get 'events/:id/new_candidate' => 'events#new_candidate'
    post 'events/create_candidate' => 'events#create_candidate'
    post 'events/import_candidate' => 'events#import_candidate'
    get 'edit_info/:id' => 'events#edit_info'
    get 'edit_voters/:id' => 'events#edit_voters'
    get 'edit_candidates/:id' => 'events#edit_candidates'
    patch 'update_info/:id' => 'events#update_info'
    get 'candidate/del/:id' => 'events#del_candidate'
    get 'event/:id' => 'events#event_statistics'
    get 'permissions' => 'permissions#list'
    get 'event/del/:id' => 'events#del_event'
    post 'create_white' => 'permissions#create_white'
    get 'white/del/:id' => 'permissions#del_white'
    post 'create_admin' => 'permissions#create_admin'
    get 'admin/del/:id' => 'permissions#del_admin'
    get 'logout' => 'votes#logout'
  end
end
