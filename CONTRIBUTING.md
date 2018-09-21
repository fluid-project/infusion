# Contributing

Thank you for your interest in contributing to and participating in the Fluid Community. A good first step is to get
acquainted with the community, review the [Documentation](https://docs.fluidproject.org), and view the [source code](https://GitHub.com/fluid-project/infusion).

The Fluid Community strives to create new community supports, open governance and recognition systems, and collaboration
techniques that help make our community more open and welcoming to all. As such, all community members (contributors,
participants and etc.) are expected to follow our
[Code of Conduct](https://wiki.fluidproject.org/display/fluid/Inclusion+in+the+Fluid+Community).

(See: [Get Involved](https://wiki.fluidproject.org/display/fluid/Get+Involved)).

## Licensing

Code contributions will be dual licensed under the [ECL 2.0](http://www.opensource.org/licenses/ecl2.php) and
[3-Clause BSD](https://opensource.org/licenses/BSD-3-Clause) licenses. Documentation contributions will be licensed
under the [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
Currently, the Fluid community asks each contributor to sign a Contributor License Agreement (CLA), which provides a
clear agreement to share code under terms amenable to
[Fluid's licensing strategy](https://wiki.fluidproject.org/display/fluid/Fluid+Licensing).

## Process/Workflow

Fluid Infusion's [source code](https://github.com/fluid-project/infusion) is hosted on GitHub. All of the code that is
included in an Infusion release lives in the master branch.
[Continuous Integration Builds](https://build.fluidproject.org) are generated and releases are all cut from the master
branch of the project repository. The project repository should always be in a working state.

Fluid Infusion uses a workflow where contributors fork the project repository, work in a branch created off of master,
and submit a pull request against the project repo's master branch to merge their contributions.

(See: [Coding and Commit Standards](https://wiki.fluidproject.org/display/fluid/Coding+and+Commit+Standards) for more
details on expectations for code contributions).

### JIRA and GitHub

Fluid Infusion uses a [JIRA](https://issues.fluidproject.org) issue tracker. All work should be associated with a
specific JIRA issue. Fluid's GitHub repositories are integrated with our JIRA instance, allowing us to easily
cross-reference specific code commits with issues in JIRA. This is accomplished by the inclusion of a JIRA issue number
in front of every commit log. JIRA can then automatically associate the change with the bug, so that watchers of an
issue can stay apprised of its progress.  The branch containing your contribution should be named after the JIRA issue.
Pull requests should also be named with the JIRA issue number at the front, to make identifying pull request in GitHub
easier.

JIRA issues should be meaningful and describe the task, bug, or feature in a way that can be understood by the
community. Opaque or general descriptions should be avoided. If you have a large task that will involve a number of
substantial commits, consider breaking it up into subtasks.

(see: [JIRA Best Practices](https://wiki.fluidproject.org/display/fluid/JIRA+Best+Practices))

### Commit Logs

All commits logs should include, at minimum, the following information:

1. A reference to the JIRA issue this commit applies to (at the beginning of the first line)
2. A short and meaningful summary of the commit, on the first line
3. A meaningful commit log describing the contents of the change

In rare cases, a commit may be trivial or entirely cosmetic (code reformatting, fixing typos in comments, etc). In those
cases, it is acceptable to use the "NOJIRA:" prefix for your log. However, it is still required to provide a meaningful
summary and descriptive commit message.

```text
FLUID-99999: Add foo function to whirlygig

Refactored the whirlygig to include a new foo algorithm based on the wireframes provided by the designers.
(http://linkToWireFrames)
```

### Unit Tests

Production-level code needs to be accompanied by a reasonable suite of unit tests. This helps others confirm that the
code is working as intended, and allows the community to adopt more agile refactoring techniques while being more
confident in our ability to avoid regressions. Please view the Documentation for using
[jqUnit](https://docs.fluidproject.org/infusion/development/jqUnit.html) and the
[IoC Testing Framework](https://docs.fluidproject.org/infusion/development/IoCTestingFramework.html) for writing tests.

### Linting

JavaScript is a highly dynamic and loose language, and many common errors are not picked up until run time. In order to
avoid errors and common pitfalls in the language, all code should be regularly checked using the provided Grunt lint
task. You may also wish to setup linting in your IDE.

```bash
# Runs Infusion's linting tasks
grunt lint
```

### Pull Requests

After a Pull Request (PR) has been submitted, one or more members of the community will review the contribution. This
typically results in a back and forth conversation and modifications to the PR. Merging into the project repo is a
manual process and requires at least one [Maintainer](https://wiki.fluidproject.org/display/fluid/Fluid+Maintainers) to
sign off on the PR and merge it into the project repo. You may wish to ping a Maintainer on the
[#fluid-work](https://wiki.fluidproject.org/display/fluid/IRC+Channel) IRC channel,
[fluid-work](https://lists.idrc.ocad.ca/mailman/listinfo/fluid-work) mailing list, and/or on the PR itself.
