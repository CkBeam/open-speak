<?php

function up_open_speak_render_cb($atts)
{
    
    ob_start();
    ?>
    <div class="open-speak-update-me"><pre style="display: none"><?php echo wp_json_encode($atts) ?></pre></div>
    <?php

    $output = ob_get_contents();
    ob_end_clean();

    return $output;
}
