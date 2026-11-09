import "@spree/sdk";

declare module "@spree/sdk" {
  interface ProductFilterExtensions {
    cf_custom_min_players_lteq?: string;
    cf_custom_max_players_gteq?: string;
    cf_custom_max_play_time_lteq?: string;
    cf_custom_min_age_lteq?: string;
    cf_custom_complexity_i_cont?: string;
    cf_custom_game_language_i_cont?: string;
  }
}
