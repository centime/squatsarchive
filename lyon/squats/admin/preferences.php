<?php
# *** LICENSE ***
# This file is part of BlogoText.
# http://lehollandaisvolant.net/blogotext/
#
# 2006      Frederic Nassar.
# 2010-2014 Timo Van Neerden <timo@neerden.eu>
#
# BlogoText is free software.
# You can redistribute it under the terms of the MIT / X11 Licence.
#
# *** LICENSE ***

$begin = microtime(TRUE);
$GLOBALS['BT_ROOT_PATH'] = '../';
require_once '../inc/inc.php';
error_reporting($GLOBALS['show_errors']);

operate_session();
if (isset($_POST['_verif_envoi'])) {
	if ($erreurs_form = valider_form_preferences()) {
		afficher_form_prefs($erreurs_form);
	} else {
		if ( (fichier_user() === TRUE) and (fichier_prefs() === TRUE) ) {
		redirection($_SERVER['PHP_SELF'].'?msg=confirm_prefs_maj');
		exit();
		}
	}
} else {
	if (isset($_GET['test_captcha'])) {
		afficher_form_captcha();
	} else {
		afficher_form_prefs();
	}
}

/*
	FORMULAIRE NORMAL DES PRÉFÉRENCES
*/
function afficher_form_prefs($erreurs = '') {
	afficher_top($GLOBALS['lang']['preferences']);
	echo '<div id="top">';
	afficher_msg($GLOBALS['lang']['preferences']);
	afficher_menu(pathinfo($_SERVER['PHP_SELF'], PATHINFO_BASENAME));
	echo '</div>';

	echo '<div id="axe">'."\n";
	echo '<div id="page">'."\n";
	echo erreurs($erreurs);

	echo '<form id="preferences" class="bordered-formbloc" method="post" action="'.$_SERVER['PHP_SELF'].'" >' ;

		$fld_securite = '<fieldset class="pref">';
		$fld_securite .= legend($GLOBALS['lang']['prefs_legend_securite'], 'legend-securite');

		$fld_securite .= '<p>'."\n";
		$fld_securite .= '<label for="identifiant">'.$GLOBALS['lang']['pref_identifiant'].'</label>'."\n";
		$fld_securite .= '<input type="text" id="identifiant" name="identifiant" size="30" value="'.$GLOBALS['identifiant'].'" class="text" />'."\n";
		$fld_securite .= '</p>'."\n";

		$fld_securite .= '<p>'."\n";
		$fld_securite .= '<label for="mdp">'.$GLOBALS['lang']['pref_mdp'].'</label>';
		$fld_securite .= '<input type="password" id="mdp" name="mdp" size="30" value="" class="text" autocomplete="off" />'."\n";
		$fld_securite .= '</p>'."\n";

		$fld_securite .= '<p>'."\n";
		$fld_securite .= '<label for="mdp_rep">'.$GLOBALS['lang']['pref_mdp_nouv'].'</label>';
		$fld_securite .= '<input type="password" id="mdp_rep" name="mdp_rep" size="30" value="" class="text" autocomplete="off" />'."\n";
		$fld_securite .= '</p>'."\n";

		$fld_securite .= '</fieldset>';
	echo $fld_securite;

		$fld_dateheure = '<fieldset class="pref">';
		$fld_dateheure .= legend($GLOBALS['lang']['prefs_legend_langdateheure'], 'legend-dateheure');

		$fld_dateheure .= '<p>'."\n";
		$fld_dateheure .= form_langue($GLOBALS['lang']['id']);
		$fld_dateheure .= '</p>'."\n";

		$fld_dateheure .= '</fieldset>';
	echo $fld_dateheure;


	// check if a new Blogotext version is available (code from Shaarli, by Sebsauvage).
	// Get latest version number at most once a day.
	if ($GLOBALS['check_update'] == 1) {
		if ( !is_file($GLOBALS['last-online-file']) or (filemtime($GLOBALS['last-online-file']) < time()-(24*60*60)) ) {
			$last_version = get_external_file('http://lehollandaisvolant.net/blogotext/version.php', 6);
			if (empty($last_version)) { $last_version = $GLOBALS['version']; }
			// If failed, nevermind. We don't want to bother the user with that.
			file_put_contents($GLOBALS['last-online-file'], $last_version); // touch file date
		}
		// Compare versions:
		$newestversion = file_get_contents($GLOBALS['last-online-file']);
		if (version_compare($newestversion, $GLOBALS['version']) == 1) {
				$fld_update = '<fieldset class="pref">';
				$fld_update .= legend($GLOBALS['lang']['maint_chk_update'], 'legend-update');
				$fld_update .= '<p>'."\n";
				$fld_update .= '<label>'.$GLOBALS['lang']['maint_update_youisbad'].' ('.$newestversion.'). '.$GLOBALS['lang']['maint_update_go_dl_it'].'</label>'."\n";
				$fld_update .= '<a href="http://lehollandaisvolant.net/blogotext/">lehollandaisvolant.net/blogotext/</a>.';
				$fld_update .= '<p>'."\n";
				$fld_update .= '</fieldset></div>'."\n";
			echo $fld_update;
		}
	}

	echo '<div class="submit centrer">';
	echo hidden_input('_verif_envoi', '1');
	echo hidden_input('token', new_token());
	echo '<input class="submit blue-square" type="submit" name="enregistrer" value="'.$GLOBALS['lang']['enregistrer'].'" />'."\n";
	echo '</div>';
	echo '</form>';
}



/*
	FORMULAIRE DE TEST DU CAPTCHA
*/
function afficher_form_captcha() {}


footer('', $begin);

