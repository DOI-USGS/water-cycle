library(targets)
library(tidyverse)

options(tidyverse.quiet = TRUE)
tar_option_set(packages = c('readxl', 'aws.s3', 'magick', 'tools'))

source("data-src/s3_upload.R")

list(
  # list input filenames
  tar_target(water_cycle_filenames,
             c('USGS_WaterCycle_English_ONLINE_20221011', 'USGS_WaterCycle_Spanish_ONLINE_20221010')),
  # track input files
  tar_target(water_cycle_raw_png,
             file.path('in', sprintf('%s.png', water_cycle_filenames)),
             format='file',
             pattern = map(water_cycle_filenames)),
  # copy input files to tmp dir, removing date from filename for ease of use in Vue
  tar_target(water_cycle_png,
             {
               tmp_filename = file.path('tmp',
                                        basename(str_replace(water_cycle_raw_png, "_(19|20)[0-9]{6}",'')))
               file.copy(water_cycle_raw_png, tmp_filename, overwrite=TRUE)
               return(tmp_filename)
             },
             format='file',
             pattern = map(water_cycle_raw_png)),
  # Generate webp versions of each png file
  tar_target(water_cycle_webp,
             {
               file_name <- file_path_sans_ext(basename(water_cycle_png))
               out_file <- sprintf('tmp/%s.webp', file_name)
               image_read(water_cycle_png) %>%
                 image_write(out_file, density = 300, quality=100, compression = "WebP")
               return(out_file)
             },
             pattern = map(water_cycle_png),
             format='file'),
  # Build list of png and webp version for each language
  tar_target(
    image_list,
    c(water_cycle_png, water_cycle_webp),
    format = 'file',
    pattern = map(water_cycle_png, water_cycle_webp)
  ),
  # store compressed images in s3
  tar_target(
    image_upload_s3, {
      # upload png and webp files for each language
      purrr::map_dfr(image_list, function(image_file) {
        file_name <- basename(image_file)
        file_s3 <- sprintf('visualizations/images/%s', file_name)
        s3_upload(filepath_s3 = file_s3,
                  on_exists = "replace",
                  filepath_local = image_file)
      })
    },
    pattern = map(image_list)
  ),
  tar_target(
    upload_log_csv,{
      file_out <- 'out/upload_log.csv'
      image_upload_s3 %>%
        write_csv(file_out)
      return(file_out)
    },
    format = "file"
  )
)