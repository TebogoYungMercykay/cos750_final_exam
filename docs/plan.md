# Project plan

TreeTutor is the COS212 app: a pre-lecture tutor for COS212 students. It teaches one data structure, the binary search tree, and one algorithm, uninformed tree search, to students who have not met either before, checks their understanding, and gives extra support where they need it before the lecture.

## Scope

- **Data structure:** the binary search tree, CS2023 AL-Foundational CS Core topic 9a (binary, n-ary and search trees). Lessons 1 to 3.
- **Algorithm:** uninformed depth first and breadth first tree search, CS2023 AL-Foundational CS Core topic 11c. Lessons 4 and 5; lesson 6 compares it with BST search.
- **Conventions:** as in the COS212 textbook (Drozdek): the root is on level 1, the height of a tree is its number of levels, and a node with two children is deleted by copying its immediate predecessor.
- **Learners:** second-year COS212 students before the lecture on trees. They read Java and know OOP; no knowledge of trees is assumed.
- **Setting:** self-paced, in a browser on a phone or laptop, in about an hour.

## Approach

- **Software engineering:** iterative and incremental delivery in short sprints, each ending in a working, deployed increment.
- **Instructional design:** a systematic design process from analysis of the learners and content, through design and development, to implementation and evaluation.
- **Content:** short lessons, each with a hook, worked examples, a guided try, a reflection and a checkpoint quiz.
- **Assessment:** a warm-up, checkpoint quizzes and a readiness check, with mastery tracked per learning outcome and extra practice offered where it falls short.
- **Accessibility:** keyboard use throughout, screen reader announcements, states shown by shape as well as colour, reduced motion support.

## Engineering

- React and TypeScript, built with Vite, as a static site with no server. Progress stays in the learner's browser.
- The algorithm code is separate from the interface and is the single source of truth for animations, exercises and marking.
- Unit, property, component, end to end and accessibility tests run on every push and pull request.
- Deployment to GitHub Pages happens from `master` only, after every check passes.

## Milestones

| When           | Milestone                                                    |
| -------------- | ------------------------------------------------------------ |
| Early November | Repository, pipeline and first working prototype             |
| Mid November   | Complete lessons, assessment and support paths; pilot; fixes |
| 16 November    | Documentation submitted                                      |
| 16 or 17 Nov   | Presentation and live demonstration                          |
