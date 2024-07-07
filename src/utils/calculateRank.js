/**
 * Calculates the exponential cdf.
 *
 * @param {number} x The value.
 * @returns {number} The exponential cdf.
 */
function exponential_cdf(x) {
  return 1 - 2 ** -x;
}

/**
 * Calculates the log normal cdf.
 *
 * @param {number} x The value.
 * @returns {number} The log normal cdf.
 */
function log_normal_cdf(x) {
  // approximation
  return x / (1 + x);
}

/**
 * Calculates the user's rank.
 *
 * @param {object} params Parameters on which the user's rank depends.
 * @param {boolean} params.all_commits Whether `include_all_commits` was used.
 * @param {number} params.commits Number of commits.
 * @param {number} params.prs The number of pull requests.
 * @param {number} params.issues The number of issues.
 * @param {number} params.reviews The number of reviews.
 * @param {number} params.repos Total number of repos.
 * @param {number} params.stars The number of stars.
 * @param {number} params.followers The number of followers.
 * @returns {{level: string, percentile: number}}} The user's rank.
 */
export function calculateRank({
  all_commits,
  commits = 0,
  prs = 0,
  issues = 0,
  reviews = 0,
  repos = 0,
  stars = 0,
  followers = 0,
}) {
  const COMMITS_MEDIAN = all_commits ? 1000 : 250,
    COMMITS_WEIGHT = 2;
  const PRS_MEDIAN = 50,
    PRS_WEIGHT = 3;
  const ISSUES_MEDIAN = 25,
    ISSUES_WEIGHT = 1;
  const REVIEWS_MEDIAN = 2,
    REVIEWS_WEIGHT = 1;
  const STARS_MEDIAN = 50,
    STARS_WEIGHT = 4;
  const FOLLOWERS_MEDIAN = 10,
    FOLLOWERS_WEIGHT = 1;
  const REPOS_MEDIAN = 3,
    REPOS_WEIGHT = 1;

  const TOTAL_WEIGHT =
    COMMITS_WEIGHT +
    PRS_WEIGHT +
    ISSUES_WEIGHT +
    REVIEWS_WEIGHT +
    STARS_WEIGHT +
    FOLLOWERS_WEIGHT +
    REPOS_WEIGHT;

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

  const rank =
    1 -
    (COMMITS_WEIGHT * exponential_cdf(commits / COMMITS_MEDIAN) +
      PRS_WEIGHT * exponential_cdf(prs / PRS_MEDIAN) +
      ISSUES_WEIGHT * exponential_cdf(issues / ISSUES_MEDIAN) +
      REVIEWS_WEIGHT * exponential_cdf(reviews / REVIEWS_MEDIAN) +
      STARS_WEIGHT * log_normal_cdf(stars / STARS_MEDIAN) +
      FOLLOWERS_WEIGHT * log_normal_cdf(followers / FOLLOWERS_MEDIAN) +
      REPOS_WEIGHT * log_normal_cdf(repos / REPOS_MEDIAN)) /
      TOTAL_WEIGHT;

  const level = LEVELS[THRESHOLDS.findIndex((t) => rank * 100 <= t)];

  return { level, percentile: rank * 100 };
}