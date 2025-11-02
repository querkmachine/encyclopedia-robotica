---
title: "Encyclopedia Robotica: The Artificial Identity resource"
eleventyExcludeFromCollections: true
formattedTitle:
  pre: Welcome to
  title: Encyclopedia Robotica
  sub: the Artificial Identity resource
redirect_from: ["/wiki/Main_page"]
---

Welcome to **Encyclopedia Robotica**, an online resource for _robotkin_: those who identify as artificial, digital beings such as machines, cyborgs, artificial intelligences, and computer programs.

## Browse by

<ul class="er-list">
{%- for tag in collections.allTags %}

<li><a class="er-ui-link" href="{{ tag | tagUrl }}">{{ tag }}</a></li>
{%- endfor %}
</ul>
