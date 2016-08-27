#!/usr/bin/perl

#  Parse out a database-derived HTML file and turn image names into links
#  Brian Capouch for Independence Cemetery Project
#  26 August 2016

$HEADER = 28;

# First $HEADER lines are boilerplate, copy to output
for ($i = 0; $i < $HEADER; $i++) {
  $nextline = <STDIN>;
  print $nextline;
}

# Continue as long as there's input
while ($nextline = <STDIN>) {
  # Each record occupies 8 lines in the table
  for($i = 0; $i < 8; $i++ ) {
    # print "Step $i\n";
    if ($i < 6) {
      if ($i == 5 ) { # Contains our cart coord
        # print "Examining $nextline\n";
        # Matches Sec-SubSec-Row-Marker
        $nextline =~ /<td align=\"left\">(\d+\-\d+\-\d+\-\d+)<\/td>/;
        $coord = $1;
      }
      print $nextline;
      $nextline = <STDIN>;
    }
    # This line has the filename; we turn it into a URL
    elsif($i == 6) {
        $coord =~ /(\d\-\d).*$/;
        $prefix = $1;
        #print "Examining $nextline\n";
        # Generically mathes all our possible image file names
        $nextline =~ /<td align=\"left\">([\w|\-|\_]*\.\w*)<\/td>/;
        $filename = $1;
        #print "Extracted $filename\n";
        print "     <td align=\"left\"><a href=\"INDEPENDENCE\/$prefix\/$filename\">Image Link<\/a>\n";
        $nextline = <STDIN>
      }
      else {
        # i == 7
        print $nextline;
        # $nextline = <STDIN>;
      }
    # $nextline = <STDIN>;
    }
}
# Close off HTML table element
print " </table>";
