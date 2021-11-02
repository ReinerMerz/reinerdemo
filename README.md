[decpad]https://github.com/ReinerMerz/reinerdemo/blob/master/stage1%20overview.png
# Ademo Module. A csui demo module

This is a CS UI Extension project used to demostrate "SmartUI Rethought"

## Pre-requisites

The following tools have to be installed, before you start:

* NodeJS 12 or newer
* Python 2 (the most recent 2.x)
* Git
* Grunt command line tool:
    npm install -g grunt-cli

## Contents

The directory structure of this project:

    ./               # Package settings
      lib/           # CS UI dependencies
      out-debug/     # This project's debug build output
      out-release/   # This project's release build output
      src/           # Module sources
        bundles/     # Module bundle definitions
      test/          # Test configuration
        debug/       # Output of the source module tests
          coverage/  # Test coverage reports
          results/   # Test result reports
        release/     # Output of the release bundle tests
          results/   # Test result reports

