function existingTag(text)
{
	var existing = false,
		text = text.toLowerCase();

	$(".tags").each(function(){
		if ($(this).text().toLowerCase() == text) 
		{
			existing = true;
			return "";
		}
	});

	return existing;
}

$(function(){
  $(".tags-new input").focus();
  
  $(".tags-new input").keyup(function(){

		var tag = $(this).val().trim(),
		length = tag.length;

		if((tag.charAt(length - 1) == ',') && (tag != ","))
		{
			tag = tag.substring(0, length - 1);

			if(!existingTag(tag))
			{
				$('<li class="tags"><span>' + tag + '</span><span class="icon icon-close"></span></li>').insertBefore($(".tags-new"));
				$(this).val("");	
			}
			else
			{
				$(this).val(tag);
			}
		}
	});
  
  $(document).on("click", ".tags span", function(){
    $(this).parent("li").remove();
  });

});
                                