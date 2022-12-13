using System;
using System.Linq;
using Nuke.Common;
using Nuke.Common.CI;
using Nuke.Common.Execution;
using Nuke.Common.IO;
using Nuke.Common.ProjectModel;
using Nuke.Common.Tooling;
using Nuke.Common.Tools.DotNet;
using Nuke.Common.Tools.Npm;
using Nuke.Common.Utilities.Collections;
using static Nuke.Common.EnvironmentInfo;
using static Nuke.Common.IO.FileSystemTasks;
using static Nuke.Common.IO.PathConstruction;
using static Nuke.Common.Tools.DotNet.DotNetTasks;
using static Nuke.Common.Tools.Npm.NpmTasks;

class Build : NukeBuild
{
    public static int Main () => Execute<Build>(x => x.Compile);

    [Parameter("Configuration to build - Default is 'Debug' (local) or 'Release' (server)")]
    readonly Configuration Configuration = IsLocalBuild ? Configuration.Debug : Configuration.Release;

    [Solution] readonly Solution Solution;

    AbsolutePath SourceDirectory => RootDirectory / "src";
    AbsolutePath ArtifactsDirectory => RootDirectory / "artifacts";

    Target Clean => _ => _
       .Before(CompileApi, CompileWeb)
       .Executes(() =>
       {
           AbsolutePath apiDirectory = SourceDirectory / "api";
           apiDirectory.GlobDirectories("**/bin", "**/obj").ForEach(DeleteDirectory);
           EnsureCleanDirectory(ArtifactsDirectory);
       });

    Target CompileApi => _ => _
        .Before(Compile)
        .Executes(() =>
        {
            DotNetRestore(s => s
                .SetProjectFile(Solution));

            DotNetPublish(s => s
                .SetProject(Solution.GetProject("AZChat"))
                .SetConfiguration(Configuration)
                .SetOutput(ArtifactsDirectory)
                .EnableNoRestore());
        });

    Target CompileWeb => _ => _
        .Before(Compile)
        .Executes(() =>
        {
            AbsolutePath webDirectory = SourceDirectory / "web";

            NpmInstall(settings => settings
                .SetProcessWorkingDirectory(webDirectory)
                .SetForce(true)
                .SetNoOptional(true)
            );

            NpmRun(settings => settings
                .SetProcessWorkingDirectory(webDirectory)
                .SetCommand("build")
            );
        });

    Target Compile => _ => _
        .DependsOn(Clean, CompileApi, CompileWeb)
        .Executes(() =>
        {
            CopyDirectoryRecursively(SourceDirectory / "web" / "dist", ArtifactsDirectory / "public");
        });
}
