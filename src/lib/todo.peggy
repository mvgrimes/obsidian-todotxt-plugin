todo =
  completed:completed?
  priority:priority?
  firstDate:date?
  secondDate:date?
  description:description
  &EOI
  { return { completed: completed, priority: priority, firstDate: firstDate, secondDate: secondDate, description: description } }

completed = @"x" ws
priority  = "(" @[A-Z] ")" ws
date      = @$( [0-9][0-9][0-9][0-9] "-" [0-9][0-9] "-" [0-9][0-9] ) ws

description = part |0.., ws|
part        = tag / context / project / link / xlink / word
word        = $chars
tag         = key:$tagName ":" value:$chars           { return { tag: key, value: value } }
context     = "@" ctx:$chars                          { return { context: ctx } }
project     = "+" prj:$chars                          { return { project: prj } }
link        = "[[" title:title "]]" &(ws / EOI)       { return { link: title  } }
xlink       = "[" title:title "]" "(" url:url ")"  &(ws / EOI)   { return { title: title, url: url }}
title       = $[^\]]+
url         = $[^\)]+


tagName = [^ \t\[\]:]+
chars   = [^ \t]+
ws      = [ \t]+
EOI     = !.
